const GymAttendance = require("../models/gymAttendanceModel");
const formatHourAMPM = require("../utils/formatHourAMPM");
const catchAsync = require("../utils/catchAsync");

// ============================================================
// HELPER: Label a count as a congestion tier
// ============================================================
function congestionTier(count) {
  if (count === 0)       return { label: "Empty",    color: "#94a3b8", emoji: "🌑" };
  if (count <= 3)        return { label: "Quiet",    color: "#22c55e", emoji: "🟢" };
  if (count <= 8)        return { label: "Moderate", color: "#f59e0b", emoji: "🟡" };
  if (count <= 15)       return { label: "Busy",     color: "#f97316", emoji: "🟠" };
  return                        { label: "Packed",   color: "#d25353", emoji: "🔴" };
}

// ============================================================
// GET /api/v1/gymspire/congestion
//
// Returns:
//  - hourlyAvg[]     → avg visitors per hour across all history
//  - peakHour        → busiest hour of the day
//  - bestHours[]     → top 3 quietest hours (within gym open hours)
//  - bestDay         → quietest day of the week
//  - todayPrediction → predicted load for each remaining hour today
//  - personalBest    → best time specifically for THIS user
//                      (avoids hours they consistently skip)
// ============================================================
exports.getCongestionPrediction = catchAsync(async (req, res, next) => {
  const openHour  = parseInt(process.env.GYM_OPENING_HOUR,  10) || 5;
  const closeHour = parseInt(process.env.GYM_CLOSING_HOUR,  10) || 23;

  // ── 1. Aggregate avg visitors by hour (Manila time) ──────
  const byHour = await GymAttendance.aggregate([
    {
      $group: {
        _id: {
          $hour: { date: "$checkinTime", timezone: "Asia/Manila" },
        },
        totalVisits: { $sum: 1 },
        // count distinct days this hour appears so we can compute avg
        days: {
          $addToSet: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$checkinTime",
              timezone: "Asia/Manila",
            },
          },
        },
      },
    },
    {
      $project: {
        hour: "$_id",
        totalVisits: 1,
        uniqueDays: { $size: "$days" },
        avgVisitors: {
          $round: [{ $divide: ["$totalVisits", { $size: "$days" }] }, 1],
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Build full 24-hour map
  const hourMap = Array.from({ length: 24 }, (_, h) => ({
    hour:        h,
    time:        formatHourAMPM(h),
    avgVisitors: 0,
    tier:        congestionTier(0),
    isOpen:      h >= openHour && h < closeHour,
  }));

  byHour.forEach((b) => {
    if (b.hour >= 0 && b.hour < 24) {
      hourMap[b.hour].avgVisitors = b.avgVisitors;
      hourMap[b.hour].tier        = congestionTier(b.avgVisitors);
    }
  });

  // ── 2. Peak hour (busiest, within open hours) ─────────────
  const openHours = hourMap.filter((h) => h.isOpen);
  const peakHour  = openHours.reduce(
    (max, h) => (h.avgVisitors > max.avgVisitors ? h : max),
    openHours[0]
  );

  // ── 3. Best hours (quietest 3, within open hours) ─────────
  const bestHours = [...openHours]
    .sort((a, b) => a.avgVisitors - b.avgVisitors)
    .slice(0, 3);

  // ── 4. Avg visitors by day of week ────────────────────────
  const byDay = await GymAttendance.aggregate([
    {
      $group: {
        _id: {
          $dayOfWeek: { date: "$checkinTime", timezone: "Asia/Manila" },
          // $dayOfWeek: 1=Sun, 2=Mon ... 7=Sat
        },
        totalVisits: { $sum: 1 },
        days: {
          $addToSet: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$checkinTime",
              timezone: "Asia/Manila",
            },
          },
        },
      },
    },
    {
      $project: {
        dayOfWeek: "$_id",
        avgVisitors: {
          $round: [{ $divide: ["$totalVisits", { $size: "$days" }] }, 1],
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayMap   = dayNames.map((name, i) => ({
    name,
    avgVisitors: 0,
    tier: congestionTier(0),
  }));

  byDay.forEach((d) => {
    const idx = d.dayOfWeek - 1; // 1-indexed → 0-indexed
    if (idx >= 0 && idx < 7) {
      dayMap[idx].avgVisitors = d.avgVisitors;
      dayMap[idx].tier        = congestionTier(d.avgVisitors);
    }
  });

  const bestDay = [...dayMap].sort((a, b) => a.avgVisitors - b.avgVisitors)[0];

  // ── 5. Today's prediction (remaining open hours) ──────────
  const now         = new Date();
  const currentHour = now.getHours();
  const currentDay  = now.getDay(); // 0=Sun

  const todayPrediction = hourMap
    .filter((h) => h.isOpen && h.hour >= currentHour)
    .map((h) => ({
      ...h,
      isPast: false,
    }));

  // ── 6. Personal best time for THIS user ───────────────────
  //    Find the quiet hours the user hasn't already been going to consistently
  let personalBest = null;

  if (req.user) {
    const userHistory = await GymAttendance.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            $hour: { date: "$checkinTime", timezone: "Asia/Manila" },
          },
          visits: { $sum: 1 },
        },
      },
    ]);

    const userHours = new Set(userHistory.map((u) => u._id));

    // Best hour = quiet gym + user hasn't been going there already
    const unusedQuietHours = bestHours.filter((h) => !userHours.has(h.hour));
    personalBest = unusedQuietHours[0] || bestHours[0];
  }

  // ── 7. Data sufficiency warning ───────────────────────────
  const totalRecords = await GymAttendance.countDocuments();
  const hasEnoughData = totalRecords >= 10; // need at least 10 check-ins for meaningful prediction

  res.status(200).json({
    status: "success",
    data: {
      hasEnoughData,
      totalRecords,
      hourlyAvg:       hourMap,
      peakHour,
      bestHours,
      bestDay,
      todayPrediction,
      personalBest,
      dayMap,
    },
  });
});

// ============================================================
// GET /api/v1/gymspire/congestion/now
// Lightweight — just current hour's predicted load vs actual
// Used for the dashboard card live indicator
// ============================================================
exports.getCongestionNow = catchAsync(async (req, res, next) => {
  const now         = new Date();
  const currentHour = now.getHours();
  const currentDay  = now.getDay();

  // Predicted (historical avg for this hour)
  const predicted = await GymAttendance.aggregate([
    {
      $group: {
        _id: {
          $hour: { date: "$checkinTime", timezone: "Asia/Manila" },
        },
        totalVisits: { $sum: 1 },
        days: {
          $addToSet: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$checkinTime",
              timezone: "Asia/Manila",
            },
          },
        },
      },
    },
    {
      $match: { _id: currentHour },
    },
    {
      $project: {
        avgVisitors: {
          $round: [{ $divide: ["$totalVisits", { $size: "$days" }] }, 1],
        },
      },
    },
  ]);

  const predictedLoad = predicted[0]?.avgVisitors ?? 0;

  // Actual (real check-ins in last 2 hours)
  const windowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const actualLoad  = await GymAttendance.countDocuments({
    checkinTime:  { $gte: windowStart },
    $or: [{ checkoutTime: null }, { checkoutTime: { $gte: now } }],
  });

  res.status(200).json({
    status: "success",
    data: {
      predictedLoad,
      actualLoad,
      tier: congestionTier(actualLoad),
      hour: formatHourAMPM(currentHour),
    },
  });
});
