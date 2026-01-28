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

exports.getGymspireNowStatus = catchAsync(async (req, res, next) => {
  // ================================
  // STEP 1: Get current  time
  // ================================
  const now = new Date();
  const currentHour = now.getHours();

  // ================================
  // STEP 2: Enforce gym operating hours
  // ================================
  const openHour = parseInt(process.env.GYM_OPENING_HOUR); // ex: 5
  const closeHour = parseInt(process.env.GYM_CLOSING_HOUR); // ex: 23

  if (currentHour < openHour || currentHour >= closeHour) {
    res.locals.currentHour = currentHour;
    res.locals.currentLoad = 0;
    // res.locals.crowdLevel = 'none';
    res.locals.recommended = false;
    res.locals.message =
      "Not recommended to workout now. Gym is currently closed.";

    return next();
  }

  // ================================
  // STEP 3: Recent activity window (last 2 hours) ⭐
  // ================================
  const endTime = new Date(now);
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // console.log("WINDOW START:", startTime.toISOString());
  // console.log("WINDOW END:", endTime.toISOString());

  // ================================
  // STEP 4: Count recent workouts
  // ================================
  const workoutCount = await WorkoutLog.countDocuments({
    date: {
      $gte: startTime,
      $lt: endTime,
    },
    status: { $in: ["ongoing", "done"] },
  });

  // console.log("WORKOUT COUNT:", workoutCount);

  // ================================
  // STEP 5: Crowd thresholds
  // ================================
  let crowdLevel;
  let recommended;
  let message;

  if (workoutCount <= 5) {
    crowdLevel = "low";
    recommended = true;
    message = "Recommended to workout now. Low gym activity detected.";
  } else if (workoutCount <= 15) {
    crowdLevel = "medium";
    recommended = true;
    message = "Workout is acceptable now. Moderate gym activity detected.";
  } else {
    crowdLevel = "high";
    recommended = false;
    message = "Not recommended to workout now due to high gym activity.";
  }

  res.locals.currentHour = currentHour;
  res.locals.currentLoad = workoutCount;
  res.locals.crowdLevel = crowdLevel;
  res.locals.recommended = recommended;
  res.locals.message = message;

  console.log(currentHour);

  // 6) Proceed to next middleware
  next();
});

/* Old
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
*/
