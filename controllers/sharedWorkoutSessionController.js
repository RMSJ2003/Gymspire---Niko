const systemExercises = require('../dev-data/data/systemExercises');
const WorkoutPlan = require('../models/workoutPlanModel');
const WorkoutLog = require('../models/workoutLogModel');
const SharedWorkoutChallenge = require('../models/sharedWorkoutChallengeModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const generateJoinCode = require('../utils/generateJoinCode');

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
    const {
        joinCode
    } = req.params;

    // ------------------------------------------------------------------
    // 1) Validate join code (challenge must exist)
    // ------------------------------------------------------------------
    const challenge = await SharedWorkoutChallenge.findOne({
        joinCode
    });

    if (!challenge) {
        return next(new AppError('Invalid join code', 404));
    }

    // ------------------------------------------------------------------
    // 2) Prevent joining if challenge already started or finished
    // ------------------------------------------------------------------
    if (challenge.status !== 'upcoming') {
        return next(new AppError('Challenge already started', 409));
    }

    // ------------------------------------------------------------------
    // 3) Prevent duplicate join
    // ------------------------------------------------------------------
    const alreadyJoined = challenge.participants.some(
        id => id.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
        return next(new AppError('You already joined this challenge', 409));
    }

    // ------------------------------------------------------------------
    // 4) Ensure user has a workout plan (business rule prerequisite)
    // ------------------------------------------------------------------
    const workoutPlan = await WorkoutPlan.findOne({
        userId: req.user._id
    });

    if (!workoutPlan) {
        return next(
            new AppError(
                'You must create a workout plan before joining a challenge',
                409
            )
        );
    }

    // ------------------------------------------------------------------
    // 5) FETCH LAST WORKOUT (ANY TYPE: plan OR challenge)
    //     This replaces "yesterday" logic entirely
    // ------------------------------------------------------------------
    const lastWorkoutLog = await WorkoutLog.findOne({
        userId: req.user._id
    }).sort({
        date: -1
    }); // most recent workout

    // ------------------------------------------------------------------
    // 6) ENFORCE 24-HOUR REST RULE (muscle-specific)
    // ------------------------------------------------------------------
    if (lastWorkoutLog) {
        // Calculate hours since last workout
        const hoursSinceLastWorkout =
            (Date.now() - lastWorkoutLog.date.getTime()) / 36e5;

        // Only enforce rule if last workout was within 24 hours
        if (hoursSinceLastWorkout < 24) {
            // Muscles trained in the last workout
            const trainedMuscles = lastWorkoutLog.exercises.map(
                ex => ex.target
            );

            // Overlap between challenge targets and recently trained muscles
            const challengeTargets = challenge.exercises.map(ex => ex.target);

            const invalidTargets = challengeTargets.filter(t =>
                trainedMuscles.includes(t)
            );

            if (invalidTargets.length) {
                return next(
                    new AppError(
                        `You trained these muscles ${Math.floor(
                            hoursSinceLastWorkout
                        )} hours ago: ${invalidTargets.join(', ')}`,
                        409
                    )
                );
            }
        }
    }

    // ------------------------------------------------------------------
    // 7) SUCCESSFUL JOIN
    // ------------------------------------------------------------------
    challenge.participants.push(req.user._id);
    await challenge.save();

    res.status(200).json({
        status: 'success',
        message: 'Successfully joined the challenge'
    });
});