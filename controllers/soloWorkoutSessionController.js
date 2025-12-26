const WorkoutLog = require('../models/workoutLogModel');
const WorkoutPlan = require('../models/workoutPlanModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getMusclesToWorkout = catchAsync(async (req, res, next) => {
    // 1) Fetch current user's workout plan 
    const workoutPlan = await WorkoutPlan.findOne({
        userId: req.user._id
    });

    if (!workoutPlan) {
        return next(new AppError('No workout plan found for this user', 404));
    }

    // 2) Get workoutPlanId
    const workoutPlanId = workoutPlan._id;

    // 3) Define yesterday's date range
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    // 4) Find yesterday's workout log
    const yesterdayWorkoutLog = await WorkoutLog.findOne({
        workoutPlanId,
        date: {
            $gte: startOfYesterday,
            $lt: endOfYesterday
        }
    });

    console.log('Yesterday workout log:', yesterdayWorkoutLog);

    // 5) Extract muscles trained yesterday
    const trainedMusclesYesterday = yesterdayWorkoutLog ?
        yesterdayWorkoutLog.exercises.map(ex => ex.target) : [];

    // 6) Filter muscles NOT trained yesterday
    const musclesToWorkout = workoutPlan.exercises.filter(ex =>
        !trainedMusclesYesterday.includes(ex.target)
    );

    // 7) Send result to frontend
    res.status(200).json({
        status: 'success',
        data: {
            musclesToWorkout,
            trainedMusclesYesterday
        }
    });
});

exports.setMusclesToWorkout = catchAsync(async (req, res, next) => {
    // ================================
    // STEP 0: Validate request body
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
    // STEP 1: Get user's workout plan
    // ================================
    const workoutPlan = await WorkoutPlan.findOne({
        userId: req.user._id
    });

    if (!workoutPlan) {
        return next(
            new AppError('No workout plan found for this user', 404)
        );
    }

    // ================================
    // STEP 2: AUTO-FINISH previous workouts
    // Rule: Only ONE ongoing workout can exist.
    // If there is any ongoing workout before today,
    // automatically mark it as "done".
    // ================================
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await WorkoutLog.updateMany({
        workoutPlanId: workoutPlan._id,
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
    // STEP 3: ENFORCE rest rule
    // Cannot train muscles worked yesterday
    // ================================
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const yesterdayWorkoutLog = await WorkoutLog.findOne({
        workoutPlanId: workoutPlan._id,
        date: {
            $gte: startOfYesterday,
            $lt: endOfYesterday
        }
    });

    if (yesterdayWorkoutLog) {
        const trainedMusclesYesterday = yesterdayWorkoutLog.exercises.map(
            ex => ex.target
        );

        const invalidTargets = targets.filter(t =>
            trainedMusclesYesterday.includes(t)
        );

        if (invalidTargets.length) {
            return next(
                new AppError(
                    `You already trained these muscles yesterday: ${invalidTargets.join(', ')}`,
                    400
                )
            );
        }
    }

    // ================================
    // STEP 3.5: Validate targets strictly
    // ================================
    const validTargets = workoutPlan.exercises.map(ex => ex.target);

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
    // STEP 4: Prepare selected exercises
    // (No sets yet — workout not started)
    // ================================
    const selectedExercises = workoutPlan.exercises
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
    // STEP 5: Prevent duplicate workout today
    // ================================
    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);

    const existingLog = await WorkoutLog.findOne({
        workoutPlanId: workoutPlan._id,
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
    // STEP 6: Create today’s workout log
    // ================================
    const workoutLog = await WorkoutLog.create({
        workoutPlanId: workoutPlan._id,
        date: new Date(),
        status: 'not yet started',
        exercises: selectedExercises
    });

    // ================================
    // STEP 7: Send response
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

    // 1️⃣ Load workout log
    const workoutLog = await WorkoutLog.findById(workoutLogId);
    if (!workoutLog) {
        return next(new AppError('Workout session not found', 404));
    }

    // 2️⃣ Verify ownership
    if (workoutLog.userId.toString() !== req.user._id.toString()) {
        return next(new AppError('You are not allowed to modify this workout', 403));
    }

    // 3️⃣ Existing guards (your logic)
    if (workoutLog.status === 'done') {
        return next(new AppError('Workout already finished', 400));
    }

    if (workoutLog.status === 'not yet started') {
        return next(new AppError('Workout not started yet', 400));
    }

    const exercise = workoutLog.exercises[exerciseIndex];
    if (!exercise) {
        return next(new AppError('Exercise not found', 404));
    }

    const set = exercise.set.find(s => s.setNumber === Number(setNumber));
    if (!set) {
        return next(new AppError('Set not found', 404));
    }

    set.weight = weight;
    set.reps = reps;
    set.unit = unit || 'LB';

    await workoutLog.save();

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