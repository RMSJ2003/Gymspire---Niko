const axios = require('axios');
const WorkoutPlan = require('../models/workoutPlanModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const muscles = ["pectorals", "lats", "upper back", "delts", "triceps", "biceps", "forearms", "abs", "quads",
    "hamstrings", "glutes", "calves"
];

exports.getAllExercises = catchAsync(async (req, res, next) => {
    // 1) Fetch ALL dumbbell exercises ONCE
    const dumbbellExercises = await axios.get(
        `${process.env.EXERCISE_DB_RAPID_API_URL}/exercises/equipment/dumbbell`, {
            headers: {
                'x-rapidapi-key': process.env.EXERCISE_DB_KEY,
                'x-rapidapi-host': process.env.EXERCISE_DB_HOST
            }
        }
    );

    res.status(200).json({
        status: 'success',
        data: dumbbellExercises.data
    });
});