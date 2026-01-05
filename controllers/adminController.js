const WorkoutLog = require("../models/workoutLogModel");
const getGymspireTime = require("../utils/getGymspireTime");
const formatHourAMPM = require("../utils/formatHourAMPM");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getGymspireTime = catchAsync(async (req, res, next) => {
  const now = getGymspireTime();
  const hour24 = now.getHours();

  res.status(200).json({
    status: "success",
    gymspireTime: now,
    hour: `${formatHourAMPM(hour24)}`,
  });
});

exports.getGymUsageByHour = catchAsync(async (req, res, next) => {
  const usage = await WorkoutLog.aggregate([
    {
      $project: {
        hour: {
          $hour: {
            date: "$date",
            timezone: "Asia/Manila",
          },
        },
      },
    },
    {
      $group: {
        _id: "$hour",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const formatted = usage.map((u) => ({
    time: formatHourAMPM(u._id),
    count: u.count,
  }));

  res.status(200).json({
    status: "success",
    data: formatted,
  });
});

exports.getRecommendedGymTime = catchAsync(async (req, res, next) => {
  // STEP 1: Aggregate gym usage by hour (Manila time)
  const usage = await WorkoutLog.aggregate([
    {
      $project: {
        hour: {
          $hour: {
            date: "$date",
            timezone: "Asia/Manila",
          },
        },
      },
    },
    {
      $group: {
        _id: "$hour",
        count: { $sum: 1 },
      },
    },
  ]);

  // STEP 2: Build a complete 24-hour map (0–23)
  const hourMap = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
  }));

  // STEP 3: Fill actual counts from aggregation
  usage.forEach((u) => {
    hourMap[u._id].count = u.count;
  });

  // STEP 4: Sort by least busy hour
  hourMap.sort((a, b) => a.count - b.count);

  // STEP 5: Pick the least busy hour
  const bestHour = hourMap[0];

  // STEP 6: Guard against no data at all
  if (usage.length === 0) {
    return res.status(200).json({
      status: "success",
      recommendedTime: "Not enough data yet",
    });
  }

  // STEP 7: Return formatted recommendation
  res.status(200).json({
    status: "success",
    recommendedTime: `${formatHourAMPM(bestHour.hour)} – ${formatHourAMPM(
      bestHour.hour + 1
    )}`,
    activityCount: bestHour.count,
  });
});
