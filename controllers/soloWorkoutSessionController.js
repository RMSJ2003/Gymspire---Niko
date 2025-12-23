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
    const {
        targets
    } = req.body;

    if (!targets || !targets.length) {
        return next(new AppError('Please select at least one muscle group', 400));
    }

    // 1) Get user's workout plan
    const workoutPlan = await WorkoutPlan.findOne({
        userId: req.user._id
    });

    if (!workoutPlan) {
        return next(new AppError('No workout plan found for this user', 404));
    }

    // 🔒 2) ENFORCE: cannot train same muscle as yesterday
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
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

    // 3) Filter exercises based on selected targets
    const selectedExercises = workoutPlan.exercises
        .filter(ex => targets.includes(ex.target))
        .map(ex => ({
            name: ex.name,
            target: ex.target,
            set: [] // EMPTY sets initially
        }));

    if (!selectedExercises.length) {
        return next(new AppError('No matching exercises found for selected muscles', 400));
    }

    // 4) Ensure only ONE workout log per day
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const existingLog = await WorkoutLog.findOne({
        workoutPlanId: workoutPlan._id,
        date: {
            $gte: startOfToday,
            $lt: endOfToday
        }
    });

    if (existingLog) {
        return next(new AppError('Workout already started today', 400));
    }

    // 5) Create workout log
    const workoutLog = await WorkoutLog.create({
        workoutPlanId: workoutPlan._id,
        date: new Date(),
        status: 'ongoing',
        exercises: selectedExercises
    });

    // 6) Send response
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

    const workoutLog = await WorkoutLog.findById(workoutLogId);

    if (!workoutLog) {
        return next(new AppError('Workout session not found', 404));
    }

    // GUARD: prevent starting twice
    if (
        workoutLog.exercises.length &&
        workoutLog.exercises[0].set.length > 0
    ) {
        return next(
            new AppError('Workout already started', 400)
        );
    }

    // Build warmup + working sets
    workoutLog.exercises.forEach(ex => {
        ex.set = [
            // Warm-ups
            {
                setNumber: 1,
                type: 'warmup',
                restSeconds: 60
            },
            {
                setNumber: 2,
                type: 'warmup',
                restSeconds: 60
            },
            {
                setNumber: 3,
                type: 'warmup',
                restSeconds: 180
            },

            // Working sets
            {
                setNumber: 4,
                type: 'working',
                restSeconds: 240
            },
            {
                setNumber: 5,
                type: 'working',
                restSeconds: 240
            },
            {
                setNumber: 6,
                type: 'working',
                restSeconds: 240
            },
        ]
    });

    await workoutLog.save();

    res.status(200).json({
        status: 'success',
        data: workoutLog
    });
});

exports.updateWorkoutSet = catchAsync(async (req, res, next) => {
    const {workoutLogId, exerciseIndex, setNumber} = req.params;
    const {weight, reps, unit} = req.body;

    const workoutLog = await WorkoutLog.findById(workoutLogId);
    if (!workoutLog) return next(
        new AppError('Workout session not found', 404)
    );

    const exercise = workoutLog.exercises[exerciseIndex];
    if (!exercise) return next(
        new AppError('Exercise not found', 404)
    );

    console.log(exercise);

    const set = exercise.set.find(s => s.setNumber === Number(setNumber));
    if (!set) return next(
        new AppError('Set not found', 404)
    );

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
    const workoutLog = await WorkoutLog.findById(req.params.id);

    if (!workoutLog) return next(
        new AppError('Workout not found', 404)
    );

    workoutLog.status = 'done';
    await workoutLog.save();

    res.status(200).json({
        status: 'success',
        data: workoutLog
    });
});