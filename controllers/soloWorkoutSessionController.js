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
        yesterdayWorkoutLog.exercises.map(ex => ex.target) :
        [];

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