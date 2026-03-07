const WorkoutLog = require("../models/workoutLogModel");
const User = require("../models/userModel");
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
  // STEP 1: Get current time
  // ================================
  const now = new Date();

  const currentHour = now.getHours();
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // ================================
  // STEP 2: Enforce gym operating hours
  // ================================
  const openHour = parseInt(process.env.GYM_OPENING_HOUR, 10);
  const closeHour = parseInt(process.env.GYM_CLOSING_HOUR, 10);

  // if (currentHour < openHour || currentHour >= closeHour) {
  //   res.locals.currentTime = currentTime;
  //   res.locals.currentLoad = 0;
  //   res.locals.recommended = false;
  //   res.locals.message =
  //     "Not recommended to workout now. iACADEMY - Gym is currently closed.";
  //   res.locals.onlineUsers = [];
  //   return next();
  // }

  // ================================
  // STEP 3: Recent activity window (last 2 hours)
  // ================================
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // ================================
  // STEP 4A: Users actively logging a workout (ongoing sessions)
  // ================================
  const onlineWorkoutLogs = await WorkoutLog.find({
    status: "ongoing",
    date: { $gte: startTime, $lt: now },
  }).populate("userId", "username pfpUrl gymStatus");

  // Deduplicate by userId
  const onlineUsersMap = new Map();

  onlineWorkoutLogs.forEach((log) => {
    if (log.userId) {
      onlineUsersMap.set(log.userId._id.toString(), {
        _id: log.userId._id,
        username: log.userId.username,
        pfpUrl: log.userId.pfpUrl,
        gymStatus: "logging", // actively logging → override with "logging"
      });
    }
  });

  // ================================
  // STEP 4B: Users who checked in manually ("I'm at the gym")
  //          but are NOT already in the map (no ongoing workout log)
  // ================================
  const checkedInUsers = await User.find({
    gymStatus: "atGym",
    isAtGym: true,
  }).select("username pfpUrl gymStatus");

  checkedInUsers.forEach((u) => {
    if (!onlineUsersMap.has(u._id.toString())) {
      onlineUsersMap.set(u._id.toString(), {
        _id: u._id,
        username: u.username,
        pfpUrl: u.pfpUrl,
        gymStatus: "atGym", // present but not logging
      });
    }
  });

  const onlineUsers = Array.from(onlineUsersMap.values());
  console.log(onlineUsers);

  // ================================
  // STEP 5: Recommendation logic
  // ================================
  const currentLoad = onlineUsers.length;

  let recommended;
  let message;

  if (currentLoad <= 5) {
    recommended = true;
    message = "Recommended to workout now. Few people currently at the gym.";
  } else if (currentLoad <= 15) {
    recommended = true;
    message = "Workout is acceptable now. Moderate gym activity.";
  } else {
    recommended = false;
    message = "Not recommended to workout now. The gym is quite busy.";
  }

  // ================================
  // STEP 6: Attach to locals
  // ================================
  res.locals.currentTime = currentTime;
  res.locals.currentLoad = currentLoad;
  res.locals.recommended = recommended;
  res.locals.message = message;
  res.locals.onlineUsers = onlineUsers;

  next();
});
