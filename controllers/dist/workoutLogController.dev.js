"use strict";

var WorkoutLog = require('../models/workoutLogModel');

var WorkoutPlan = require('../models/workoutPlanModel');

var Challenge = require('../models/challengeModel');

var AppError = require('../utils/appError');

var catchAsync = require('../utils/catchAsync');

var ensureNoOngoingWorkoutLog = require('../utils/ensureNoOngoingWorkoutLogs');

var createDefaultSets = require('../utils/defaultWorkoutSets');

var _require = require('../services/restRule.service'),
    enforceMuscleRest = _require.enforceMuscleRest;

exports.createMySoloWorkoutLog = catchAsync(function _callee(req, res, next) {
  var targets, lastWorkoutLog, planExercises, validTargets, invalidTargets, selectedExercises, newWorkoutLog;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          targets = req.body.targets; // 🚫 Global guard

          _context.next = 3;
          return regeneratorRuntime.awrap(ensureNoOngoingWorkoutLog(req.user._id));

        case 3:
          if (!(!Array.isArray(targets) || targets.length === 0)) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", next(new AppError('Please select at least one muscle group', 400)));

        case 5:
          _context.next = 7;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: req.user._id
          }).sort({
            date: -1
          }));

        case 7:
          lastWorkoutLog = _context.sent;
          _context.prev = 8;
          enforceMuscleRest({
            lastWorkoutLog: lastWorkoutLog,
            targets: targets
          });
          _context.next = 15;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](8);
          return _context.abrupt("return", next(new AppError(_context.t0.message, 409)));

        case 15:
          planExercises = req.workoutPlan.exerciseDetails;
          validTargets = planExercises.map(function (ex) {
            return ex.target;
          });
          invalidTargets = targets.filter(function (t) {
            return !validTargets.includes(t);
          });

          if (!invalidTargets.length) {
            _context.next = 20;
            break;
          }

          return _context.abrupt("return", next(new AppError("Invalid muscle targets: ".concat(invalidTargets.join(', ')), 400)));

        case 20:
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
            _context.next = 23;
            break;
          }

          return _context.abrupt("return", next(new AppError('No matching exercises found', 400)));

        case 23:
          _context.next = 25;
          return regeneratorRuntime.awrap(WorkoutLog.create({
            userId: req.user._id,
            workoutPlanId: req.workoutPlan._id,
            status: 'ongoing',
            exercises: selectedExercises
          }));

        case 25:
          newWorkoutLog = _context.sent;
          res.status(201).json({
            status: 'success',
            data: newWorkoutLog
          });

        case 27:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[8, 12]]);
});
exports.createMyChallengeWorkoutLog = catchAsync(function _callee2(req, res, next) {
  var challenge, joined, alreadyLogged, challengeExercises, lastWorkoutLog, challengeTargets, newChallengeWorkoutLog;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          challenge = req.challenge; // 🚫 Global guard

          _context2.next = 3;
          return regeneratorRuntime.awrap(ensureNoOngoingWorkoutLog(req.user._id));

        case 3:
          joined = challenge.participants.some(function (id) {
            return id.toString() === req.user._id.toString();
          });

          if (joined) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", next(new AppError('You are not a participant of this challenge', 409)));

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: req.user._id,
            challengeId: challenge._id
          }));

        case 8:
          alreadyLogged = _context2.sent;

          if (!alreadyLogged) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", next(new AppError('You already have a workout log for this challenge', 409)));

        case 11:
          challengeExercises = challenge.exerciseDetails.map(function (ex) {
            return {
              name: ex.name,
              target: ex.target,
              gifURL: ex.gifURL,
              set: createDefaultSets()
            };
          });
          _context2.next = 14;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: req.user._id
          }).sort({
            date: -1
          }));

        case 14:
          lastWorkoutLog = _context2.sent;
          challengeTargets = challengeExercises.map(function (ex) {
            return ex.target;
          });
          _context2.prev = 16;
          enforceMuscleRest({
            lastWorkoutLog: lastWorkoutLog,
            targets: challengeTargets
          });
          _context2.next = 23;
          break;

        case 20:
          _context2.prev = 20;
          _context2.t0 = _context2["catch"](16);
          return _context2.abrupt("return", next(new AppError(_context2.t0.message, 409)));

        case 23:
          _context2.next = 25;
          return regeneratorRuntime.awrap(WorkoutLog.create({
            userId: req.user._id,
            challengeId: challenge._id,
            status: 'ongoing',
            exercises: challengeExercises
          }));

        case 25:
          newChallengeWorkoutLog = _context2.sent;
          res.status(201).json({
            status: 'success',
            data: newChallengeWorkoutLog
          });

        case 27:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[16, 20]]);
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
exports.updateMyWorkoutSet = catchAsync(function _callee4(req, res, next) {
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

          return _context5.abrupt("return", next(new AppError('Workout log not found', 404)));

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
            _context5.next = 20;
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
          if (!(!req.body.videoUrl || req.body.videoUrl.trim() === '')) {
            _context5.next = 19;
            break;
          }

          return _context5.abrupt("return", next(new AppError('videoUrl is required for challenge workouts', 400)));

        case 19:
          workoutLog.videoUrl = req.body.videoUrl;

        case 20:
          if (!(workoutLog.status === 'done')) {
            _context5.next = 22;
            break;
          }

          return _context5.abrupt("return", next(new AppError('Workout already finished', 400)));

        case 22:
          // ✅ Finish workout
          workoutLog.status = 'done';
          _context5.next = 25;
          return regeneratorRuntime.awrap(workoutLog.save());

        case 25:
          // schema validators still apply
          res.status(200).json({
            status: 'success',
            data: workoutLog
          });

        case 26:
        case "end":
          return _context5.stop();
      }
    }
  });
});