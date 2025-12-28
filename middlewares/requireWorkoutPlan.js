const WorkoutPlan = require('../models/workoutPlanModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(async(req, res, next) => {
    const workoutPlan = await WorkoutPlan.findOne({
        userId: req.user._id
    });

    if (!workoutPlan) return next(
        new AppError('You must create a workout plan first', 409)
    );

    // It attaches data to the request object so the next middleware / controller can 
    // reuse it
    req.workoutPlan = workoutPlan;

    next();
});