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
exports.getRecommendedGymTime = catchAsync(function _callee3(req, res, next) {
  var usage, hourMap, bestHour;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
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
          }]));

        case 2:
          usage = _context3.sent;
          // STEP 2: Build a complete 24-hour map (0–23)
          hourMap = Array.from({
            length: 24
          }, function (_, hour) {
            return {
              hour: hour,
              count: 0
            };
          }); // STEP 3: Fill actual counts from aggregation

          usage.forEach(function (u) {
            hourMap[u._id].count = u.count;
          }); // STEP 4: Sort by least busy hour

          hourMap.sort(function (a, b) {
            return a.count - b.count;
          }); // STEP 5: Pick the least busy hour

          bestHour = hourMap[0]; // STEP 6: Guard against no data at all

          if (!(usage.length === 0)) {
            _context3.next = 9;
            break;
          }

          return _context3.abrupt("return", res.status(200).json({
            status: "success",
            recommendedTime: "Not enough data yet"
          }));

        case 9:
          // STEP 7: Return formatted recommendation
          res.status(200).json({
            status: "success",
            recommendedTime: "".concat(formatHourAMPM(bestHour.hour), " \u2013 ").concat(formatHourAMPM(bestHour.hour + 1)),
            activityCount: bestHour.count
          });

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  });
});