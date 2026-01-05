const systemExercises = require("../dev-data/data/systemExercises");
const mongoose = require("mongoose");
const WorkoutLog = require("../models/workoutLogModel");
const Challenge = require("../models/challengeModel");
const Exercise = require("../models/exerciseModel");
const handlerFactory = require("./handlerFactory");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateJoinCode = require("../utils/generateJoinCode");
const { enforceMuscleRest } = require("../services/restRule.service");

// Note: you will create a workoutLog with challengeId in this function
exports.createChallenge = catchAsync(async (req, res, next) => {
  const { name, exerciseIds, startTime, endTime } = req.body;

  // 0) Validate if exerciseIds is an array
  if (!Array.isArray(exerciseIds) || exerciseIds.length === 0)
    return next(new AppError("exerciseIds must be a non-empty array", 400));

  // 1) Validate if exerciseIds array contain valid elements
  const validObjectIds = exerciseIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  const invalidFormatIds = exerciseIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidFormatIds.length > 0) {
    return next(
      new AppError(
        `Invalid exerciseIds format: ${invalidFormatIds.join(", ")}`,
        400
      )
    );
  }

  // 2) Fetch exercises
  const exercisesFromDb = await Exercise.find({
    _id: {
      $in: validObjectIds,
    },
  });

  // 3) Validate existence
  const foundIds = exercisesFromDb.map((ex) => ex._id.toString());

  const notFoundIds = validObjectIds.filter((id) => !foundIds.includes(id));

  if (notFoundIds.length > 0) {
    return next(
      new AppError(`ExerciseIds not found: ${notFoundIds.join(", ")}`, 400)
    );
  }

  // 4) Validate NO duplicate targets
  const targets = exercisesFromDb.map((ex) => ex.target);
  const uniqueTargets = new Set(targets);

  if (targets.length !== uniqueTargets.size) {
    return next(
      new AppError("Each muscle group can only have ONE exercise.", 400)
    );
  }

  // 5) Save ObjectIds of exercises
  const exercises = exercisesFromDb.map((ex) => ex._id);

  // 6) Generate the join code
  const joinCode = generateJoinCode();

  // 7) Create the challenge
  const newChallenge = await Challenge.create({
    name,
    joinCode,
    startTime,
    endTime,
    exercises,
  });

  // 8) Send response
  res.status(200).json({
    status: "success",
    data: newChallenge,
  });
});

exports.joinChallenge = catchAsync(async (req, res, next) => {
  // ------------------------------------------------------------------
  // STEP 1: Validate join code (challenge must exist)
  // ------------------------------------------------------------------
  const challenge = req.challenge;

  if (!challenge) {
    return next(new AppError("Invalid join code", 404));
  }

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
  const alreadyJoined = challenge.participants.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (alreadyJoined) {
    return next(new AppError("You already joined this challenge", 409));
  }

  // ------------------------------------------------------------------
  // STEP 4: Fetch user's most recent workout (solo OR challenge)
  // ------------------------------------------------------------------
  const lastWorkoutLog = await WorkoutLog.findOne({
    userId: req.user._id,
  }).sort({
    date: -1,
  });

  // ------------------------------------------------------------------
  // STEP 5: Extract challenge muscle targets
  // (these are the muscles the challenge will train)
  // ------------------------------------------------------------------
  const challengeTargets = challenge.exercises.map((ex) => ex.target);

  // ------------------------------------------------------------------
  // STEP 6: Enforce 24-hour muscle rest rule
  // Uses shared domain service
  // ------------------------------------------------------------------
  try {
    enforceMuscleRest({
      lastWorkoutLog,
      targets: challengeTargets,
    });
  } catch (err) {
    return next(new AppError(err.message, 409));
  }

  // ------------------------------------------------------------------
  // STEP 7: Successful join
  // ------------------------------------------------------------------
  challenge.participants.push(req.user._id);
  await challenge.save();

  res.status(200).json({
    status: "success",
    message: "Successfully joined the challenge",
  });
});

// Problem: This doesn't send response and just calls next()
exports.getChallenge = catchAsync(async (req, res, next) => {
  // ================================
  // STEP 1: Extract possible identifiers
  // ================================
  const { joinCode, challengeId } = req.params;

  // ================================
  // STEP 2: Determine query source
  // ================================
  let query;

  if (joinCode) {
    query = {
      joinCode,
    };
  } else if (challengeId) {
    query = {
      _id: challengeId,
    };
  } else {
    return next(new AppError("Challenge identifier is required", 400));
  }

  // ================================
  // STEP 3: Fetch challenge
  // ================================
  const challenge = await Challenge.findOne(query).populate("exerciseDetails");

  if (!challenge) {
    return next(new AppError("Challenge not found", 404));
  }

  // ================================
  // STEP 4: Attach to request
  // ================================
  req.challenge = challenge;

  next();
});

exports.getAllChallenges = catchAsync(async (req, res, next) => {
  const challenges = await Challenge.find().populate("exerciseDetails");

  res.status(200).json({
    status: "success",
    results: challenges.length,
    data: {
      data: challenges,
    },
  });
});

exports.getLeaderboard = catchAsync(async (req, res, next) => {
  const { challengeId } = req.params;

  const leaderboard = await WorkoutLog.aggregate([
    // 1) Only this challenge
    {
      $match: {
        challengeId: new mongoose.Types.ObjectId(challengeId),
        status: "done",
        judgeStatus: "approved",
      },
    },

    // 2) Join user info
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    // 3) Shape leaderboard row
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        username: "$user.username",
        strengthScore: 1,
      },
    },

    // 4) Sort strongest first
    {
      $sort: { strengthScore: -1 },
    },

    // 5) Rank users
    {
      $setWindowFields: {
        sortBy: { strengthScore: -1 },
        output: {
          rank: { $rank: {} },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: leaderboard.length,
    data: leaderboard
  });
});
