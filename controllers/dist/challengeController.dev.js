"use strict";

var systemExercises = require("../dev-data/data/systemExercises");

var mongoose = require("mongoose");

var WorkoutLog = require("../models/workoutLogModel");

var Challenge = require("../models/challengeModel");

var Exercise = require("../models/exerciseModel");

var handlerFactory = require("./handlerFactory");

var AppError = require("../utils/appError");

var catchAsync = require("../utils/catchAsync");

var generateJoinCode = require("../utils/generateJoinCode");

var _require = require("../services/restRule.service"),
    enforceMuscleRest = _require.enforceMuscleRest; // Note: you will create a workoutLog with challengeId in this function


exports.createChallenge = catchAsync(function _callee(req, res, next) {
  var _req$body, name, exerciseIds, startTime, endTime, validObjectIds, invalidFormatIds, exercisesFromDb, foundIds, notFoundIds, targets, uniqueTargets, exercises, joinCode, newChallenge;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, name = _req$body.name, exerciseIds = _req$body.exerciseIds, startTime = _req$body.startTime, endTime = _req$body.endTime; // 0) Validate if exerciseIds is an array

          if (!(!Array.isArray(exerciseIds) || exerciseIds.length === 0)) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", next(new AppError("exerciseIds must be a non-empty array", 400)));

        case 3:
          // 1) Validate if exerciseIds array contain valid elements
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

          return _context.abrupt("return", next(new AppError("Invalid exerciseIds format: ".concat(invalidFormatIds.join(", ")), 400)));

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

          return _context.abrupt("return", next(new AppError("ExerciseIds not found: ".concat(notFoundIds.join(", ")), 400)));

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

          return _context.abrupt("return", next(new AppError("Each muscle group can only have ONE exercise.", 400)));

        case 18:
          // 5) Save ObjectIds of exercises
          exercises = exercisesFromDb.map(function (ex) {
            return ex._id;
          }); // 6) Generate the join code

          joinCode = generateJoinCode(); // 7) Create the challenge

          _context.next = 22;
          return regeneratorRuntime.awrap(Challenge.create({
            name: name,
            joinCode: joinCode,
            startTime: startTime,
            endTime: endTime,
            exercises: exercises
          }));

        case 22:
          newChallenge = _context.sent;
          // 8) Send response
          res.status(200).json({
            status: "success",
            data: newChallenge
          });

        case 24:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.joinChallenge = catchAsync(function _callee2(req, res, next) {
  var challenge, alreadyJoined, lastWorkoutLog, challengeTargets;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // ------------------------------------------------------------------
          // STEP 1: Validate join code (challenge must exist)
          // ------------------------------------------------------------------
          challenge = req.challenge;

          if (challenge) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new AppError("Invalid join code", 404)));

        case 3:
          // // ------------------------------------------------------------------
          // // STEP 2: Prevent joining if challenge already started or finished
          // // ------------------------------------------------------------------
          // const now = new Date();
          // // Checks if the challenge has not started yet.
          // if (now < challenge.startTime) return next(
          //     new AppError('Challenge not started yet', 409)
          // );
          // // Checks if the challenge has ended already
          // if (now > challenge.endTime) return next(
          //     new AppError('Challenge has already ended', 409)
          // );
          // ------------------------------------------------------------------
          // STEP 3: Prevent duplicate join
          // ------------------------------------------------------------------
          alreadyJoined = challenge.participants.some(function (id) {
            return id.toString() === req.user._id.toString();
          });

          if (!alreadyJoined) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", next(new AppError("You already joined this challenge", 409)));

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(WorkoutLog.findOne({
            userId: req.user._id
          }).sort({
            date: -1
          }));

        case 8:
          lastWorkoutLog = _context2.sent;
          // ------------------------------------------------------------------
          // STEP 5: Extract challenge muscle targets
          // (these are the muscles the challenge will train)
          // ------------------------------------------------------------------
          challengeTargets = challenge.exercises.map(function (ex) {
            return ex.target;
          }); // ------------------------------------------------------------------
          // STEP 6: Enforce 24-hour muscle rest rule
          // Uses shared domain service
          // ------------------------------------------------------------------

          _context2.prev = 10;
          enforceMuscleRest({
            lastWorkoutLog: lastWorkoutLog,
            targets: challengeTargets
          });
          _context2.next = 17;
          break;

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](10);
          return _context2.abrupt("return", next(new AppError(_context2.t0.message, 409)));

        case 17:
          // ------------------------------------------------------------------
          // STEP 7: Successful join
          // ------------------------------------------------------------------
          challenge.participants.push(req.user._id);
          _context2.next = 20;
          return regeneratorRuntime.awrap(challenge.save());

        case 20:
          res.status(200).json({
            status: "success",
            message: "Successfully joined the challenge"
          });

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[10, 14]]);
}); // Problem: This doesn't send response and just calls next()

exports.getChallenge = catchAsync(function _callee3(req, res, next) {
  var _req$params, joinCode, challengeId, query, challenge;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // ================================
          // STEP 1: Extract possible identifiers
          // ================================
          _req$params = req.params, joinCode = _req$params.joinCode, challengeId = _req$params.challengeId; // ================================
          // STEP 2: Determine query source
          // ================================

          if (!joinCode) {
            _context3.next = 5;
            break;
          }

          query = {
            joinCode: joinCode
          };
          _context3.next = 10;
          break;

        case 5:
          if (!challengeId) {
            _context3.next = 9;
            break;
          }

          query = {
            _id: challengeId
          };
          _context3.next = 10;
          break;

        case 9:
          return _context3.abrupt("return", next(new AppError("Challenge identifier is required", 400)));

        case 10:
          _context3.next = 12;
          return regeneratorRuntime.awrap(Challenge.findOne(query).populate("exerciseDetails"));

        case 12:
          challenge = _context3.sent;

          if (challenge) {
            _context3.next = 15;
            break;
          }

          return _context3.abrupt("return", next(new AppError("Challenge not found", 404)));

        case 15:
          // ================================
          // STEP 4: Attach to request
          // ================================
          req.challenge = challenge;
          next();

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.getAllChallenges = catchAsync(function _callee4(req, res, next) {
  var challenges;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(Challenge.find().populate("exerciseDetails"));

        case 2:
          challenges = _context4.sent;
          res.status(200).json({
            status: "success",
            results: challenges.length,
            data: {
              data: challenges
            }
          });

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.getLeaderboard = catchAsync(function _callee5(req, res, next) {
  var challengeId, leaderboard;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          challengeId = req.params.challengeId;
          _context5.next = 3;
          return regeneratorRuntime.awrap(WorkoutLog.aggregate([// 1) Only this challenge
          {
            $match: {
              challengeId: new mongoose.Types.ObjectId(challengeId),
              status: "done",
              judgeStatus: "approved"
            }
          }, // 2) Join user info
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user"
            }
          }, {
            $unwind: "$user"
          }, // 3) Shape leaderboard row
          {
            $project: {
              _id: 0,
              userId: "$user._id",
              username: "$user.username",
              strengthScore: 1
            }
          }, // 4) Sort strongest first
          {
            $sort: {
              strengthScore: -1
            }
          }, // 5) Rank users
          {
            $setWindowFields: {
              sortBy: {
                strengthScore: -1
              },
              output: {
                rank: {
                  $rank: {}
                }
              }
            }
          }]));

        case 3:
          leaderboard = _context5.sent;
          res.status(200).json({
            status: 'success',
            results: leaderboard.length,
            data: leaderboard
          });

        case 5:
        case "end":
          return _context5.stop();
      }
    }
  });
});