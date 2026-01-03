"use strict";

var WorkoutLog = require('../models/workoutLogModel');

var WorkoutPlan = require('../models/workoutPlanModel');

var Challenge = require('../models/challengeModel');

var AppError = require('../utils/appError');

var catchAsync = require('../utils/catchAsync');

var createDefaultSets = require('../utils/defaultWorkoutSets');

var _require = require('../services/restRule.service'),
    enforceMuscleRest = _require.enforceMuscleRest;

exports.createSoloWorkoutLog = catchAsync(function _callee(req, res, next) {
  var targets, lastWorkoutLog, planExercises, validTargets, invalidTargets, selectedExercises, startOfToday, endOfToday, existingLog, newWorkoutLog;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          targets = req.body.targets; // 1) Validate request body

          if (!(!Array.isArray(targets) || targets.length === 0)) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", next(new AppError('Please select at least one muscle group', 400)));

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: req.user._id
          }).sort({
            date: -1
          }));

        case 5:
          lastWorkoutLog = _context.sent;
          _context.prev = 6;
          enforceMuscleRest({
            lastWorkoutLog: lastWorkoutLog,
            targets: targets
          });
          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](6);
          return _context.abrupt("return", next(new AppError(_context.t0.message, 409)));

        case 13:
          // 3) Validate targets exist in workout plan
          planExercises = req.workoutPlan.exerciseDetails;
          validTargets = planExercises.map(function (ex) {
            return ex.target;
          });
          invalidTargets = targets.filter(function (t) {
            return !validTargets.includes(t);
          });

          if (!(invalidTargets.length > 0)) {
            _context.next = 18;
            break;
          }

          return _context.abrupt("return", next(new AppError("Invalid muscle targets: ".concat(invalidTargets.join(', ')), 400)));

        case 18:
          // 4) Select exercises based on targets
          selectedExercises = planExercises.filter(function (ex) {
            return targets.includes(ex.target);
          }).map(function (ex) {
            return {
              name: ex.name,
              target: ex.target,
              gifURL: ex.gifURL,
              set: createDefaultSets()
            };
          });

          if (selectedExercises.length) {
            _context.next = 21;
            break;
          }

          return _context.abrupt("return", next(new AppError('No matching exercises found for selected muscles', 400)));

        case 21:
          // 5) Prevent duplicate workout today
          startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          endOfToday = new Date(startOfToday);
          endOfToday.setHours(23, 59, 59, 999);
          _context.next = 27;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: req.user._id,
            date: {
              $gte: startOfToday,
              $lt: endOfToday
            }
          }));

        case 27:
          existingLog = _context.sent;

          if (!existingLog) {
            _context.next = 30;
            break;
          }

          return _context.abrupt("return", next(new AppError('Workout already started today', 400)));

        case 30:
          _context.next = 32;
          return regeneratorRuntime.awrap(WorkoutLog.create({
            userId: req.user._id,
            workoutPlanId: req.workoutPlan._id,
            date: new Date(),
            status: 'ongoing',
            exercises: selectedExercises
          }));

        case 32:
          newWorkoutLog = _context.sent;
          res.status(201).json({
            status: 'success',
            data: newWorkoutLog
          });

        case 34:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[6, 10]]);
});
exports.createChallengeWorkoutLog = catchAsync(function _callee2(req, res, next) {
  var challenge, joined, existingChallengeLog, challengeExercises, lastWorkoutLog, challengeTargets, newChallengeLog;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          challenge = req.challenge;
          joined = challenge.participants.some(function (id) {
            return id.toString() === req.user._id.toString();
          });

          if (joined) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", next(new AppError('You are not a participant of this challenge', 409)));

        case 4:
          _context2.next = 6;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: req.user._id,
            challengeId: challenge._id,
            status: {
              $ne: 'done'
            }
          }));

        case 6:
          existingChallengeLog = _context2.sent;

          if (!existingChallengeLog) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", next(new AppError('You already have an ongoing workout for this challenge', 409)));

        case 9:
          // ================================
          // STEP 5: Fetch challenge exercises (targets)
          // - Extract muscle targets from challenge.exercises
          // - These will be used for rest rule enforcement
          // ================================
          challengeExercises = challenge.exerciseDetails.map(function (ex) {
            return {
              name: ex.name,
              target: ex.target,
              gifURL: ex.gifURL,
              set: createDefaultSets()
            };
          }); // Populate the sets

          challengeExercises.forEach(function (ex) {
            ex.set = createDefaultSets();
          }); // ================================
          // STEP 6: Fetch user's most recent workout log
          // - Include both solo and challenge workouts
          // - This is needed for recovery validation
          // ================================

          _context2.next = 13;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: req.user._id
          }).sort({
            date: -1
          }));

        case 13:
          lastWorkoutLog = _context2.sent;
          // ================================
          // STEP 7: Enforce 24-hour muscle rest rule
          // - Compare challenge targets vs last workout muscles
          // - Block if recovery time has not passed
          // ================================
          // Extract the targets
          challengeTargets = challengeExercises.map(function (ex) {
            return ex.target;
          });
          _context2.prev = 15;
          enforceMuscleRest({
            lastWorkoutLog: lastWorkoutLog,
            targets: challengeTargets
          });
          _context2.next = 22;
          break;

        case 19:
          _context2.prev = 19;
          _context2.t0 = _context2["catch"](15);
          return _context2.abrupt("return", next(new AppError(_context2.t0.message, 409)));

        case 22:
          _context2.next = 24;
          return regeneratorRuntime.awrap(WorkoutLog.create({
            userId: req.user._id,
            challengeId: challenge._id,
            status: 'ongoing',
            exercises: challengeExercises
          }));

        case 24:
          newChallengeLog = _context2.sent;
          // ================================
          // STEP 10: Send success response
          // - Return created workout log metadata
          // ================================
          res.status(200).json({
            status: 'success',
            data: newChallengeLog
          });

        case 26:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[15, 19]]);
});
exports.getMyWorkoutLogs = catchAsync(function _callee3(req, res, next) {
  var workoutLogs;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(WorkoutLog.find({
            userId: req.user._id
          }));

        case 2:
          workoutLogs = _context3.sent;
          res.status(200).json({
            status: 'success',
            data: workoutLogs
          });

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.updateWorkoutSet = catchAsync(function _callee4(req, res, next) {
  var _req$params, workoutLogId, exerciseIndex, setNumber, _req$body, weight, reps, unit, workoutLog, exercise, set;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$params = req.params, workoutLogId = _req$params.workoutLogId, exerciseIndex = _req$params.exerciseIndex, setNumber = _req$params.setNumber;
          _req$body = req.body, weight = _req$body.weight, reps = _req$body.reps, unit = _req$body.unit; // ======================================================
          // STEP 1: Load workout log
          // ======================================================

          _context4.next = 4;
          return regeneratorRuntime.awrap(WorkoutLog.findById(workoutLogId));

        case 4:
          workoutLog = _context4.sent;

          if (workoutLog) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Workout log not found', 404)));

        case 7:
          if (!(workoutLog.userId.toString() !== req.user._id.toString())) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", next(new AppError('You are not allowed to modify this workout', 403)));

        case 9:
          if (!(workoutLog.status === 'done')) {
            _context4.next = 11;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Workout already finished', 400)));

        case 11:
          if (!(workoutLog.status === 'not yet started')) {
            _context4.next = 13;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Workout not started yet', 400)));

        case 13:
          if (!(!workoutLog.workoutPlanId && !workoutLog.challengeId)) {
            _context4.next = 15;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Invalid workout session type', 400)));

        case 15:
          // ======================================================
          // STEP 5: Validate exercise index
          // ======================================================
          exercise = workoutLog.exercises[exerciseIndex];

          if (exercise) {
            _context4.next = 18;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Exercise not found', 404)));

        case 18:
          // ======================================================
          // STEP 6: Validate set number
          // ======================================================
          set = exercise.set.find(function (s) {
            return s.setNumber === Number(setNumber);
          });

          if (set) {
            _context4.next = 21;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Set not found', 404)));

        case 21:
          // ======================================================
          // STEP 7: Update set values
          // ======================================================
          set.weight = weight;
          set.reps = reps;
          set.unit = unit || 'LB'; // ======================================================
          // STEP 8: Save workout log
          // ======================================================

          _context4.next = 26;
          return regeneratorRuntime.awrap(workoutLog.save());

        case 26:
          // ======================================================
          // STEP 9: Send response
          // ======================================================
          res.status(200).json({
            status: 'success',
            data: workoutLog
          });

        case 27:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.finishWorkoutLog = catchAsync(function _callee5(req, res, next) {
  var workoutLog, workoutPlan, challenge;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(WorkoutLog.findById(req.params.workoutLogId));

        case 2:
          workoutLog = _context5.sent;

          if (workoutLog) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", next(new AppError('Workout not found', 404)));

        case 5:
          if (!workoutLog.workoutPlanId) {
            _context5.next = 11;
            break;
          }

          _context5.next = 8;
          return regeneratorRuntime.awrap(WorkoutPlan.findById(workoutLog.workoutPlanId));

        case 8:
          workoutPlan = _context5.sent;

          if (!(!workoutPlan || workoutPlan.userId.toString() !== req.user._id.toString())) {
            _context5.next = 11;
            break;
          }

          return _context5.abrupt("return", next(new AppError('Not authorized', 403)));

        case 11:
          if (!workoutLog.challengeId) {
            _context5.next = 17;
            break;
          }

          _context5.next = 14;
          return regeneratorRuntime.awrap(Challenge.findById(workoutLog.challengeId));

        case 14:
          challenge = _context5.sent;

          if (!(!challenge || !challenge.participants.some(function (p) {
            return p.toString() === req.user._id.toString();
          }))) {
            _context5.next = 17;
            break;
          }

          return _context5.abrupt("return", next(new AppError('Not authorized', 403)));

        case 17:
          if (!(workoutLog.status === 'done')) {
            _context5.next = 19;
            break;
          }

          return _context5.abrupt("return", next(new AppError('Workout already finished', 400)));

        case 19:
          // ✅ Finish workout
          workoutLog.status = 'done';
          _context5.next = 22;
          return regeneratorRuntime.awrap(workoutLog.save());

        case 22:
          res.status(200).json({
            status: 'success',
            data: workoutLog
          });

        case 23:
        case "end":
          return _context5.stop();
      }
    }
  });
});