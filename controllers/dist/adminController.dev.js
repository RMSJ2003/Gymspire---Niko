"use strict";

var WorkoutLog = require("../models/workoutLogModel");

var getGymspireTime = require("../utils/getGymspireTime");

var formatHourAMPM = require("../utils/formatHourAMPM");

var AppError = require("../utils/appError");

var catchAsync = require("../utils/catchAsync");

exports.getGymspireTime = catchAsync(function _callee(req, res, next) {
  var now, hour24;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          now = getGymspireTime();
          hour24 = now.getHours();
          res.status(200).json({
            status: "success",
            gymspireTime: now,
            hour: "".concat(formatHourAMPM(hour24))
          });

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.getGymUsageByHour = catchAsync(function _callee2(req, res, next) {
  var usage, formatted;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(WorkoutLog.aggregate([{
            $project: {
              hour: {
                $hour: {
                  date: "$date",
                  timezone: "Asia/Manila"
                }
              }
            }
          }, {
            $group: {
              _id: "$hour",
              count: {
                $sum: 1
              }
            }
          }, {
            $sort: {
              _id: 1
            }
          }]));

        case 2:
          usage = _context2.sent;
          formatted = usage.map(function (u) {
            return {
              time: formatHourAMPM(u._id),
              count: u.count
            };
          });
          res.status(200).json({
            status: "success",
            data: formatted
          });

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.getGymspireNowStatus = catchAsync(function _callee3(req, res, next) {
  var now, currentHour, openHour, closeHour, endTime, startTime, workoutCount, crowdLevel, recommended, message;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // ================================
          // STEP 1: Get current  time
          // ================================
          now = new Date();
          currentHour = now.getHours(); // ================================
          // STEP 2: Enforce gym operating hours
          // ================================

          openHour = parseInt(process.env.GYM_OPENING_HOUR); // ex: 5

          closeHour = parseInt(process.env.GYM_CLOSING_HOUR); // ex: 23

          if (!(currentHour < openHour || currentHour >= closeHour)) {
            _context3.next = 10;
            break;
          }

          res.locals.currentHour = currentHour;
          res.locals.currentLoad = 0; // res.locals.crowdLevel = 'none';

          res.locals.recommended = false;
          res.locals.message = "Not recommended to workout now. Gym is currently closed.";
          return _context3.abrupt("return", next());

        case 10:
          // ================================
          // STEP 3: Recent activity window (last 2 hours) ⭐
          // ================================
          endTime = new Date(now);
          startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
          console.log("WINDOW START:", startTime.toISOString());
          console.log("WINDOW END:", endTime.toISOString()); // ================================
          // STEP 4: Count recent workouts
          // ================================

          _context3.next = 16;
          return regeneratorRuntime.awrap(WorkoutLog.countDocuments({
            date: {
              $gte: startTime,
              $lt: endTime
            },
            status: {
              $in: ["ongoing", "done"]
            }
          }));

        case 16:
          workoutCount = _context3.sent;
          console.log("WORKOUT COUNT:", workoutCount); // ================================
          // STEP 5: Crowd thresholds
          // ================================

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
          console.log(currentHour); // 6) Proceed to next middleware

          next();

        case 26:
        case "end":
          return _context3.stop();
      }
    }
  });
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