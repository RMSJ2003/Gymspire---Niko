const WorkoutLog = require('../models/workoutLogModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.updateWorkoutSet = catchAsync(async (req, res, next) => {
    const { workoutLogId, exerciseIndex, setNumber } = req.params;
    const { weight, reps, unit } = req.body;

    // ======================================================
    // STEP 1: Load workout log
    // ======================================================
    const workoutLog = await WorkoutLog.findById(workoutLogId);
    if (!workoutLog) {
        return next(new AppError('Workout session not found', 404));
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
