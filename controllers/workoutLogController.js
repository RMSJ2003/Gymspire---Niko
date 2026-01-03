const WorkoutLog = require('../models/workoutLogModel');
const WorkoutPlan = require('../models/workoutPlanModel');
const Challenge = require('../models/challengeModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ensureNoOngoingWorkoutLog = require('../utils/ensureNoOngoingWorkoutLogs');
const createDefaultSets = require('../utils/defaultWorkoutSets');
const {
    enforceMuscleRest
} = require('../services/restRule.service');

exports.createMySoloWorkoutLog = catchAsync(async (req, res, next) => {
    const {
        targets
    } = req.body;

    // 🚫 Global guard
    await ensureNoOngoingWorkoutLog(req.user._id);

    if (!Array.isArray(targets) || targets.length === 0) {
        return next(new AppError('Please select at least one muscle group', 400));
    }

    const lastWorkoutLog = await WorkoutLog.findOne({
        userId: req.user._id
    }).sort({
        date: -1
    });

    try {
        enforceMuscleRest({
            lastWorkoutLog,
            targets
        });
    } catch (err) {
        return next(new AppError(err.message, 409));
    }

    const planExercises = req.workoutPlan.exerciseDetails;
    const validTargets = planExercises.map(ex => ex.target);

    const invalidTargets = targets.filter(t => !validTargets.includes(t));
    if (invalidTargets.length) {
        return next(new AppError(
            `Invalid muscle targets: ${invalidTargets.join(', ')}`, 400
        ));
    }

    const selectedExercises = planExercises
        .filter(ex => targets.includes(ex.target))
        .map(ex => ({
            name: ex.name,
            target: ex.target,
            gifURL: ex.gifURL,
            set: createDefaultSets()
        }));

    if (!selectedExercises.length) {
        return next(new AppError('No matching exercises found', 400));
    }

    const newWorkoutLog = await WorkoutLog.create({
        userId: req.user._id,
        workoutPlanId: req.workoutPlan._id,
        status: 'ongoing',
        exercises: selectedExercises
    });

    res.status(201).json({
        status: 'success',
        data: newWorkoutLog
    });
});


exports.createMyChallengeWorkoutLog = catchAsync(async (req, res, next) => {
    const challenge = req.challenge;

    // 🚫 Global guard
    await ensureNoOngoingWorkoutLog(req.user._id);

    const joined = challenge.participants.some(
        id => id.toString() === req.user._id.toString()
    );

    if (!joined) {
        return next(new AppError(
            'You are not a participant of this challenge', 409
        ));
    }

    // ✅ Keep THIS guard (one log per challenge per user)
    const alreadyLogged = await WorkoutLog.findOne({
        userId: req.user._id,
        challengeId: challenge._id
    });

    if (alreadyLogged) {
        return next(new AppError(
            'You already have a workout log for this challenge',
            409
        ));
    }

    const challengeExercises = challenge.exerciseDetails.map(ex => ({
        name: ex.name,
        target: ex.target,
        gifURL: ex.gifURL,
        set: createDefaultSets()
    }));

    const lastWorkoutLog = await WorkoutLog.findOne({
        userId: req.user._id
    }).sort({
        date: -1
    });

    const challengeTargets = challengeExercises.map(ex => ex.target);

    try {
        enforceMuscleRest({
            lastWorkoutLog,
            targets: challengeTargets
        });
    } catch (err) {
        return next(new AppError(err.message, 409));
    }

    const newChallengeWorkoutLog = await WorkoutLog.create({
        userId: req.user._id,
        challengeId: challenge._id,
        status: 'ongoing',
        exercises: challengeExercises
    });

    res.status(201).json({
        status: 'success',
        data: newChallengeWorkoutLog
    });
});

exports.getMyWorkoutLogs = catchAsync(async (req, res, next) => {
    const workoutLogs = await WorkoutLog.find({
        userId: req.user._id
    });

    res.status(200).json({
        status: 'success',
        data: workoutLogs
    })
});

exports.updateMyWorkoutSet = catchAsync(async (req, res, next) => {
    const {
        workoutLogId,
        exerciseIndex,
        setNumber
    } = req.params;
    const {
        weight,
        reps,
        unit
    } = req.body;

    // ======================================================
    // STEP 1: Load workout log
    // ======================================================
    const workoutLog = await WorkoutLog.findById(workoutLogId);
    if (!workoutLog) {
        return next(new AppError('Workout log not found', 404));
    }

    // ======================================================
    // STEP 2: Verify ownership
    // User can only modify their own workout log
    // ======================================================
    if (workoutLog.userId.toString() !== req.user._id.toString()) {
        return next(
            new AppError('You are not allowed to modify this workout', 403)
        );
    }

    // ======================================================
    // STEP 3: Verify workout state
    // ======================================================
    if (workoutLog.status === 'done') {
        return next(new AppError('Workout already finished', 400));
    }

    if (workoutLog.status === 'not yet started') {
        return next(new AppError('Workout not started yet', 400));
    }

    // ======================================================
    // STEP 4: Verify workout type permissions
    // ======================================================
    // If this is a challenge workout, ensure challengeId exists
    // (permission logic can be expanded later if needed)
    if (!workoutLog.workoutPlanId && !workoutLog.challengeId) {
        return next(
            new AppError('Invalid workout session type', 400)
        );
    }

    // ======================================================
    // STEP 5: Validate exercise index
    // ======================================================
    const exercise = workoutLog.exercises[exerciseIndex];
    if (!exercise) {
        return next(new AppError('Exercise not found', 404));
    }

    // ======================================================
    // STEP 6: Validate set number
    // ======================================================
    const set = exercise.set.find(
        s => s.setNumber === Number(setNumber)
    );
    if (!set) {
        return next(new AppError('Set not found', 404));
    }

    // ======================================================
    // STEP 7: Update set values
    // ======================================================
    set.weight = weight;
    set.reps = reps;
    set.unit = unit || 'LB';

    // ======================================================
    // STEP 8: Save workout log
    // ======================================================
    await workoutLog.save();

    // ======================================================
    // STEP 9: Send response
    // ======================================================
    res.status(200).json({
        status: 'success',
        data: workoutLog
    });
});

exports.finishWorkoutLog = catchAsync(async (req, res, next) => {
    const workoutLog = await WorkoutLog.findById(req.params.workoutLogId);

    if (!workoutLog) {
        return next(new AppError('Workout log not found', 404));
    }

    // 🔐 AUTHORIZATION
    if (workoutLog.workoutPlanId) {
        const workoutPlan = await WorkoutPlan.findById(workoutLog.workoutPlanId);

        if (
            !workoutPlan ||
            workoutPlan.userId.toString() !== req.user._id.toString()
        ) {
            return next(new AppError('Not authorized', 403));
        }
    }

    if (workoutLog.challengeId) {
        const challenge = await Challenge.findById(workoutLog.challengeId);

        if (
            !challenge ||
            !challenge.participants.some(
                p => p.toString() === req.user._id.toString()
            )
        ) {
            return next(new AppError('Not authorized', 403));
        }

        // 🎥 REQUIRE VIDEO FOR CHALLENGE
        if (!req.body.videoUrl || req.body.videoUrl.trim() === '') {
            return next(
                new AppError('videoUrl is required for challenge workouts', 400)
            );
        }

        workoutLog.videoUrl = req.body.videoUrl;
    }

    // 🚫 Prevent double finish
    if (workoutLog.status === 'done') {
        return next(new AppError('Workout already finished', 400));
    }

    // ✅ Finish workout
    workoutLog.status = 'done';
    await workoutLog.save(); // schema validators still apply

    res.status(200).json({
        status: 'success',
        data: workoutLog
    });
});