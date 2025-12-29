const WorkoutLog = require('../models/workoutLogModel');
const WorkoutPlan = require('../models/workoutPlanModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
    enforceMuscleRest
} = require('../services/restRule.service');

exports.getMusclesToWorkout = catchAsync(async (req, res, next) => {
    // ======================================================
    // STEP 1: Fetch the user's most recent workout (any type)
    // ======================================================
    const lastWorkoutLog = await WorkoutLog.findOne({
        userId: req.user._id
    }).sort({
        date: -1
    });

    // ======================================================
    // STEP 2: Extract muscles trained in the last workout
    // (empty array if no previous workout exists)
    // ======================================================
    const trainedMuscles = lastWorkoutLog ?
        lastWorkoutLog.exercises.map(ex => ex.target) :
        [];

    // ======================================================
    // STEP 3: Filter muscles that are NOT in recovery
    // ======================================================
    const musclesToWorkout = req.workoutPlan.exercises.filter(ex =>
        !trainedMuscles.includes(ex.target)
    );

    // ======================================================
    // STEP 4: Send response
    // ======================================================
    res.status(200).json({
        status: 'success',
        data: {
            musclesToWorkout,
            trainedMuscles
        }
    });
});

exports.setMusclesToWorkout = catchAsync(async (req, res, next) => {
    // ================================
    // STEP 1: Validate request body
    // ================================
    const {
        targets
    } = req.body;

    if (!targets || !targets.length) {
        return next(
            new AppError('Please select at least one muscle group', 400)
        );
    }

    // ================================
    // STEP 2: Auto-finish old ongoing workouts
    // Rule: Only one ongoing workout may exist
    // ================================
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await WorkoutLog.updateMany({
        userId: req.user._id,
        status: 'ongoing',
        date: {
            $lt: startOfToday
        }
    }, {
        $set: {
            status: 'done'
        }
    });

    // ================================
    // STEP 3: Fetch most recent workout
    // (solo OR challenge)
    // ================================
    const lastWorkoutLog = await WorkoutLog.findOne({
        userId: req.user._id
    }).sort({
        date: -1
    });

    // ================================
    // STEP 4: Enforce 24-hour muscle rest rule
    // Uses shared domain service
    // ================================
    try {
        enforceMuscleRest({
            lastWorkoutLog,
            targets
        });
    } catch (err) {
        return next(new AppError(err.message, 409));
    }

    // ================================
    // STEP 5: Validate targets strictly
    // (must exist in user's workout plan)
    // ================================
    const validTargets = req.workoutPlan.exercises.map(ex => ex.target);

    const invalidTargets = targets.filter(
        t => !validTargets.includes(t)
    );

    if (invalidTargets.length) {
        return next(
            new AppError(
                `Invalid muscle targets: ${invalidTargets.join(', ')}`,
                400
            )
        );
    }

    // ================================
    // STEP 6: Prepare selected exercises
    // (no sets yet)
    // ================================
    const selectedExercises = req.workoutPlan.exercises
        .filter(ex => targets.includes(ex.target))
        .map(ex => ({
            name: ex.name,
            target: ex.target,
            set: []
        }));

    if (!selectedExercises.length) {
        return next(
            new AppError('No matching exercises found for selected muscles', 400)
        );
    }

    // ================================
    // STEP 7: Prevent duplicate workout today
    // ================================
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

    // ================================
    // STEP 8: Create today's workout log
    // ================================
    const workoutLog = await WorkoutLog.create({
        userId: req.user._id,
        workoutPlanId: req.workoutPlan._id,
        date: new Date(),
        status: 'not yet started',
        exercises: selectedExercises
    });

    // ================================
    // STEP 9: Send response
    // ================================
    res.status(201).json({
        status: 'success',
        data: workoutLog
    });
});

// The weight of the warm up sets wil be calculated in the frontend.
// This prepares the workout structure before the user lifts.
exports.startSoloWorkoutSession = catchAsync(async (req, res, next) => {
    const {
        workoutLogId
    } = req.params;

    // 1️⃣ Load workout log
    const workoutLog = await WorkoutLog.findById(workoutLogId);
    if (!workoutLog) {
        return next(new AppError('Workout session not found', 404));
    }

    // 2️⃣ Prevent starting twice
    if (
        workoutLog.exercises.length &&
        workoutLog.exercises[0].set.length > 0
    ) {
        return next(
            new AppError('Workout already started', 400)
        );
    }

    // 3️⃣ Build warmup + working sets
    workoutLog.exercises.forEach(ex => {
        ex.set = [
            // Warm-ups
            {
                setNumber: 1,
                type: 'warmup',
                weight: 0,
                reps: 0,
                restSeconds: 60
            },
            {
                setNumber: 2,
                type: 'warmup',
                weight: 0,
                reps: 0,
                restSeconds: 60
            },
            {
                setNumber: 3,
                type: 'warmup',
                weight: 0,
                reps: 0,
                restSeconds: 180
            },

            // Working sets (3 sets, 4 min rest)
            {
                setNumber: 4,
                type: 'working',
                weight: 0,
                reps: 0,
                restSeconds: 240
            },
            {
                setNumber: 5,
                type: 'working',
                weight: 0,
                reps: 0,
                restSeconds: 240
            },
            {
                setNumber: 6,
                type: 'working',
                weight: 0,
                reps: 0,
                restSeconds: 240
            }
        ];
    });

    // 4️⃣ EXPLICITLY mark workout as ongoing
    workoutLog.status = 'ongoing';

    // 5️⃣ Save workout log
    await workoutLog.save();

    // 6️⃣ Send response
    res.status(200).json({
        status: 'success',
        data: workoutLog
    });
});

exports.finishWorkoutSession = catchAsync(async (req, res, next) => {
    const workoutLog = await WorkoutLog.findById(req.params.workoutLogId);

    if (!workoutLog) return next(
        new AppError('Workout not found', 404)
    );

    // Prevent finishing someone else's workout
    const workoutPlan = await WorkoutPlan.findById(workoutLog.workoutPlanId);
    if (!workoutPlan || workoutPlan.userId.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }

    // Prevent double finish
    if (workoutLog.status === 'done') {
        return next(new AppError('Workout already finished', 400));
    }

    workoutLog.status = 'done';
    await workoutLog.save();

    res.status(200).json({
        status: 'success',
        data: workoutLog
    });
});