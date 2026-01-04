"use strict";

var mongoose = require('mongoose');

var WorkoutPlan = require('../models/workoutPlanModel');

var Exercise = require('../models/exerciseModel');

var AppError = require('../utils/appError');

var catchAsync = require('../utils/catchAsync');

exports.createMyWorkoutPlan = catchAsync(function _callee(req, res, next) {
  var exerciseIds, validObjectIds, invalidFormatIds, exercisesFromDb, foundIds, notFoundIds, targets, uniqueTargets, existingWorkoutPlan, exercises, newWorkoutPlan;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          exerciseIds = req.body.exerciseIds; // 0) Validate input

          if (!(!Array.isArray(exerciseIds) || exerciseIds.length === 0)) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", next(new AppError('Please provide an array of exercise _ids', 400)));

        case 3:
          // 1) Validate ObjectId FORMAT first
          validObjectIds = exerciseIds.filter(function (id) {
            return mongoose.Types.ObjectId.isValid(id);
          });
          invalidFormatIds = exerciseIds.filter(function (id) {
            return !mongoose.Types.ObjectId.isValid(id);
          });

          if (!(invalidFormatIds.length > 0)) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", next(new AppError("Invalid exerciseIds format: ".concat(invalidFormatIds.join(', ')), 400)));

        case 7:
          _context.next = 9;
          return regeneratorRuntime.awrap(Exercise.find({
            _id: {
              $in: validObjectIds
            }
          }));

        case 9:
          exercisesFromDb = _context.sent;
          // 3) Validate existence
          foundIds = exercisesFromDb.map(function (ex) {
            return ex._id.toString();
          });
          notFoundIds = validObjectIds.filter(function (id) {
            return !foundIds.includes(id);
          });

          if (!(notFoundIds.length > 0)) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", next(new AppError("ExerciseIds not found: ".concat(notFoundIds.join(', ')), 400)));

        case 14:
          // 4) Validate NO duplicate targets
          targets = exercisesFromDb.map(function (ex) {
            return ex.target;
          });
          uniqueTargets = new Set(targets);

          if (!(targets.length !== uniqueTargets.size)) {
            _context.next = 18;
            break;
          }

          return _context.abrupt("return", next(new AppError('Each muscle group can only have ONE exercise.', 400)));

        case 18:
          _context.next = 20;
          return regeneratorRuntime.awrap(WorkoutPlan.findOne({
            userId: req.user._id
          }));

        case 20:
          existingWorkoutPlan = _context.sent;

          if (!existingWorkoutPlan) {
            _context.next = 23;
            break;
          }

          return _context.abrupt("return", next(new AppError('You already have a workout plan.', 400)));

        case 23:
          // 6) Save ObjectIds
          exercises = exercisesFromDb.map(function (ex) {
            return ex._id;
          });
          _context.next = 26;
          return regeneratorRuntime.awrap(WorkoutPlan.create({
            userId: req.user._id,
            exercises: exercises
          }));

        case 26:
          newWorkoutPlan = _context.sent;
          res.status(201).json({
            status: 'success',
            data: newWorkoutPlan
          });

        case 28:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.getMyWorkoutPlan = catchAsync(function _callee2(req, res, next) {
  var workoutPlan;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          workoutPlan = req.workoutPlan;
          res.status(200).json({
            status: 'success',
            data: workoutPlan
          });

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.updateMyWorkoutPlan = catchAsync(function _callee3(req, res, next) {
  var exerciseIds, validObjectIds, invalidFormatIds, exercisesFromDb, foundIds, notFoundIds, targets, uniqueTargets, exercises, updatedWorkoutPlan;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          exerciseIds = req.body.exerciseIds; // 0) Validate input

          if (!(!Array.isArray(exerciseIds) || exerciseIds.length === 0)) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", next(new AppError('Please provide an array of exercise _ids', 400)));

        case 3:
          // 1) Validate ObjectId FORMAT first
          validObjectIds = exerciseIds.filter(function (id) {
            return mongoose.Types.ObjectId.isValid(id);
          });
          invalidFormatIds = exerciseIds.filter(function (id) {
            return !mongoose.Types.ObjectId.isValid(id);
          });

          if (!(invalidFormatIds.length > 0)) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", next(new AppError("Invalid exerciseIds format: ".concat(invalidFormatIds.join(', ')), 400)));

        case 7:
          _context3.next = 9;
          return regeneratorRuntime.awrap(Exercise.find({
            _id: {
              $in: validObjectIds
            }
          }));

        case 9:
          exercisesFromDb = _context3.sent;
          // 3) Validate existence
          foundIds = exercisesFromDb.map(function (ex) {
            return ex._id.toString();
          });
          notFoundIds = validObjectIds.filter(function (id) {
            return !foundIds.includes(id);
          });

          if (!(notFoundIds.length > 0)) {
            _context3.next = 14;
            break;
          }

          return _context3.abrupt("return", next(new AppError("ExerciseIds not found: ".concat(notFoundIds.join(', ')), 400)));

        case 14:
          // 4) Validate NO duplicate targets
          targets = exercisesFromDb.map(function (ex) {
            return ex.target;
          });
          uniqueTargets = new Set(targets);

          if (!(targets.length !== uniqueTargets.size)) {
            _context3.next = 18;
            break;
          }

          return _context3.abrupt("return", next(new AppError('Each muscle group can only have ONE exercise.', 400)));

        case 18:
          // 5) Update workout plan
          exercises = exercisesFromDb.map(function (ex) {
            return ex._id;
          });
          _context3.next = 21;
          return regeneratorRuntime.awrap(WorkoutPlan.findOneAndUpdate({
            userId: req.user._id
          }, {
            exercises: exercises
          }, {
            "new": true,
            runValidators: true
          }));

        case 21:
          updatedWorkoutPlan = _context3.sent;

          if (updatedWorkoutPlan) {
            _context3.next = 24;
            break;
          }

          return _context3.abrupt("return", next(new AppError('Workout plan not found.', 404)));

        case 24:
          // 6) Send response
          res.status(200).json({
            status: 'success',
            data: updatedWorkoutPlan
          });

        case 25:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.deleteMyWorkoutPlan = catchAsync(function _callee4(req, res, next) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(WorkoutPlan.deleteOne({
            userId: req.user._id
          }));

        case 2:
          res.status(204).json({
            status: 'success',
            data: null
          });

        case 3:
        case "end":
          return _context4.stop();
      }
    }
  });
});