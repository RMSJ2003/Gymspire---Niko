const WorkoutSplit = require('../models/workoutSplitModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const SPLIT_TEMPLATES = require('../utils/splitGenerator');

exports.createWorkoutSplit = catchAsync(async (req, res, next) => {
    // *Next step is to generate split based on total days.

    const {
        totalDays
    } = req.body;

    if (!totalDays || totalDays < 2 || totalDays > 7) return next(
        new AppError('Invalid totalDays. Please choose 2-7 workout days.', 400)
    );
    
    const split = Array.from({
        length: totalDays
    }, (_, i) => ({
        day: i + 1,
        workouts: [] // user can add workouts later
    }));    

    const newSplit = await WorkoutSplit.create({
        userId: req.user.id,
        totalDays,
        split
    });

    res.status(201).json({
        status: 'success',
        data: {
            workoutSplit: newSplit
        }
    });
});