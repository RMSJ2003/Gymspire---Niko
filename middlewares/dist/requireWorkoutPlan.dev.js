"use strict";

var WorkoutPlan = require('../models/workoutPlanModel');

var AppError = require('../utils/appError');

var catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(function _callee(req, res, next) {
  var workoutPlan;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(WorkoutPlan.findOne({
            userId: req.user._id
          }).populate('exerciseDetails'));

        case 2:
          workoutPlan = _context.sent;

          if (workoutPlan) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", next(new AppError('You do not have a workout plan. Please create one first.', 409)));

        case 5:
          // It attaches data to the request object so the next middleware / controller can 
          // reuse it
          req.workoutPlan = workoutPlan;
          next();

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});