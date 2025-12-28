const systemExercises = require('../dev-data/data/systemExercises');
const WorkoutLog = require('../models/workoutLogModel');
const SharedWorkoutChallenge = require('../models/sharedWorkoutChallengeModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const generateJoinCode = require('../utils/generateJoinCode');
const { enforceMuscleRest } = require('../services/restRule.service');

// Note: you will create a workoutLog with challengeId in this function
exports.createChallenge = catchAsync(async (req, res, next) => {
    const {
        name,
        targets,
        startTime,
        endTime
    } = req.body;

    // 1) Validate if targets is an array
    if (!Array.isArray(targets) || targets.length === 0) return next(
        new AppError('targets must be a non-empty array', 400)
    );

    // 2) Validate if targets array contain valid elements (muscle names)
    const validMuscles = Object.keys(systemExercises);

    const invalid = targets.filter(m => !validMuscles.includes(m));

    if (invalid.length) {
        return next(
            new AppError(`Invalid muscles: ${invalid.join(', ')}`, 400)
        );
    }

    // 3) Generate the join code
    const joinCode = generateJoinCode();

    // 4) Prepare the selected exercises
    const selectedExercises = targets.map(muscle => ({
        target: muscle,
        name: systemExercises[muscle]
    }));

    // 5) Creat the challenge
    const newChallenge = await SharedWorkoutChallenge.create({
        name,
        joinCode,
        startTime,
        endTime,
        status: 'upcoming',
        exercises: selectedExercises
    });

    res.status(200).json({
        status: 'success',
        data: {
            newChallenge
        }
    });
});

exports.joinChallenge = catchAsync(async (req, res, next) => {
    const { joinCode } = req.params;

    // ------------------------------------------------------------------
    // STEP 1: Validate join code (challenge must exist)
    // ------------------------------------------------------------------
    const challenge = await SharedWorkoutChallenge.findOne({ joinCode });

    if (!challenge) {
        return next(new AppError('Invalid join code', 404));
    }

    // ------------------------------------------------------------------
    // STEP 2: Prevent joining if challenge already started or finished
    // ------------------------------------------------------------------
    if (challenge.status !== 'upcoming') {
        return next(new AppError('Challenge already started', 409));
    }

    // ------------------------------------------------------------------
    // STEP 3: Prevent duplicate join
    // ------------------------------------------------------------------
    const alreadyJoined = challenge.participants.some(
        id => id.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
        return next(new AppError('You already joined this challenge', 409));
    }

    // ------------------------------------------------------------------
    // STEP 4: Fetch user's most recent workout (solo OR challenge)
    // ------------------------------------------------------------------
    const lastWorkoutLog = await WorkoutLog.findOne({
        userId: req.user._id
    }).sort({ date: -1 });

    // ------------------------------------------------------------------
    // STEP 5: Extract challenge muscle targets
    // (these are the muscles the challenge will train)
    // ------------------------------------------------------------------
    const challengeTargets = challenge.exercises.map(
        ex => ex.target
    );

    // ------------------------------------------------------------------
    // STEP 6: Enforce 24-hour muscle rest rule
    // Uses shared domain service
    // ------------------------------------------------------------------
    try {
        enforceMuscleRest({
            lastWorkoutLog,
            targets: challengeTargets
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
        status: 'success',
        message: 'Successfully joined the challenge'
    });
});