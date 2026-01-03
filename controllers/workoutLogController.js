const WorkoutLog = require('../models/workoutLogModel');
const WorkoutPlan = require('../models/workoutPlanModel');
const Challenge = require('../models/challengeModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const createDefaultSets = require('../utils/defaultWorkoutSets');
const {
    enforceMuscleRest
} = require('../services/restRule.service');

exports.createSoloWorkoutLog = catchAsync(async (req, res, next) => {
    const {
        targets
    } = req.body;

    // 1) Validate request body
    if (!Array.isArray(targets) || targets.length === 0) {
        return next(
            new AppError('Please select at least one muscle group', 400)
        );
    }

    // 2) Enforce muscle rest rule
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

    // 3) Validate targets exist in workout plan
    const planExercises = req.workoutPlan.exerciseDetails;

    const validTargets = planExercises.map(ex => ex.target);

    const invalidTargets = targets.filter(
        t => !validTargets.includes(t)
    );

    if (invalidTargets.length > 0) {
        return next(
            new AppError(
                `Invalid muscle targets: ${invalidTargets.join(', ')}`,
                400
            )
        );
    }

    // 4) Select exercises based on targets
    const selectedExercises = planExercises
        .filter(ex => targets.includes(ex.target))
        .map(ex => ({
            name: ex.name,
            target: ex.target,
            gifURL: ex.gifURL,
            set: createDefaultSets()
        }));

    if (!selectedExercises.length) {
        return next(
            new AppError('No matching exercises found for selected muscles', 400)
        );
    }

    // 5) Prevent duplicate workout today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);

    const existingLog = await WorkoutLog.findOne({
        userId: req.user._id,
        date: {
            $gte: startOfToday,
            $lt: endOfToday
        }
    });

    if (existingLog) {
        return next(
            new AppError('Workout already started today', 400)
        );
    }

    // 6) Create workout log with generated sets
    const newWorkoutLog = await WorkoutLog.create({
        userId: req.user._id,
        workoutPlanId: req.workoutPlan._id,
        date: new Date(),
        status: 'ongoing',
        exercises: selectedExercises
    });

    res.status(201).json({
        status: 'success',
        data: newWorkoutLog
    });
});

exports.createChallengeWorkoutLog = catchAsync(async (req, res, next) => {
    const challenge = req.challenge;

    const joined = challenge.participants.some(
        id => id.toString() === req.user._id.toString()
    );

    if (!joined) {
        return next(new AppError('You are not a participant of this challenge', 409));
    }

    const existingChallengeLog = await WorkoutLog.findOne({
        userId: req.user._id,
        challengeId: challenge._id,
        status: {
            $ne: 'done'
        }
    });

    // If an active or not-yet-finished log exists,
    // block creation of a new challenge workout log
    if (existingChallengeLog) {
        return next(
            new AppError(
                'You already have an ongoing workout for this challenge',
                409
            )
        );
    }

    // ================================
    // STEP 5: Fetch challenge exercises (targets)
    // - Extract muscle targets from challenge.exercises
    // - These will be used for rest rule enforcement
    // ================================
    const challengeExercises = challenge.exerciseDetails
        .map(ex => ({
            name: ex.name,
            target: ex.target,
            gifURL: ex.gifURL,
            set: createDefaultSets()
        }));

    // Populate the sets
    challengeExercises.forEach(ex => {
        ex.set = createDefaultSets();
    });

    // ================================
    // STEP 6: Fetch user's most recent workout log
    // - Include both solo and challenge workouts
    // - This is needed for recovery validation
    // ================================
    const lastWorkoutLog = await WorkoutLog.findOne({
        userId: req.user._id
    }).sort({
        date: -1
    });

    // ================================
    // STEP 7: Enforce 24-hour muscle rest rule
    // - Compare challenge targets vs last workout muscles
    // - Block if recovery time has not passed
    // ================================
    // Extract the targets
    const challengeTargets = challengeExercises.map(ex => ex.target);

    try {
        enforceMuscleRest({
            lastWorkoutLog,
            targets: challengeTargets
        });
    } catch (err) {
        return next(new AppError(err.message, 409));
    }

    // ================================
    // STEP 9: Create the challenge workout log
    // - Attach challengeId
    // - Attach userId
    // - Initialize exercises from challenge
    // - Set status to "not yet started"
    // ================================
    const newChallengeLog = await WorkoutLog.create({
        userId: req.user._id,
        challengeId: challenge._id,
        status: 'ongoing',
        exercises: challengeExercises
    });

    // ================================
    // STEP 10: Send success response
    // - Return created workout log metadata
    // ================================

    res.status(200).json({
        status: 'success',
        data: newChallengeLog
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

exports.updateWorkoutSet = catchAsync(async (req, res, next) => {
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
        return next(new AppError('Workout not found', 404));
    }

    // 🔐 AUTHORIZATION
    if (workoutLog.workoutPlanId) {
        // SOLO WORKOUT → owner is workout plan user
        const workoutPlan = await WorkoutPlan.findById(workoutLog.workoutPlanId);

        if (
            !workoutPlan ||
            workoutPlan.userId.toString() !== req.user._id.toString()
        ) {
            return next(new AppError('Not authorized', 403));
        }
    }

    if (workoutLog.challengeId) {
        // CHALLENGE WORKOUT → owner is participant
        const challenge = await Challenge.findById(
            workoutLog.challengeId
        );

        if (
            !challenge ||
            !challenge.participants.some(
                p => p.toString() === req.user._id.toString()
            )
        ) {
            return next(new AppError('Not authorized', 403));
        }
    }

    // 🚫 Prevent double finish
    if (workoutLog.status === 'done') {
        return next(new AppError('Workout already finished', 400));
    }

    // ✅ Finish workout
    workoutLog.status = 'done';
    await workoutLog.save();

    res.status(200).json({
        status: 'success',
        data: workoutLog
    });
});