"use strict";

var WorkoutLog = require('../models/workoutLogModel');

var AppError = require('../utils/appError');

module.exports = function _callee(userId) {
  var startOfToday, endOfToday, existingWorkout;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          endOfToday = new Date(startOfToday);
          endOfToday.setHours(23, 59, 59, 999);
          _context.next = 6;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: userId,
            date: {
              $gte: startOfToday,
              $lt: endOfToday
            }
          }));

        case 6:
          existingWorkout = _context.sent;

          if (!existingWorkout) {
            _context.next = 9;
            break;
          }

          throw new AppError('You already have a workout logged today. You can only do one workout per day.', 409);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
};