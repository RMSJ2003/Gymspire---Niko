const axios = require('axios');
const WorkoutPlan = require('../models/workoutPlanModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const muscles = ["pectorals", "upper back", "delts", "triceps", "biceps", "forearms", "abs", "quads",
    "hamstrings", "glutes", "calves"
];

// *the exercise will be displayed for users to choose exercises per each muscle group. 
exports.getAllExercises = catchAsync(async (req, res, next) => {
    const baseURL = `${process.env.EXERCISE_DB_URL}/api/v1/exercises/filter`;

    const grouped = {};

    const promises = muscles.map(muscle =>
        axios.get(baseURL, {
            params: {
                offset: 0,
                limit: 500,
                muscles: muscle,
                equipment: 'dumbbell'
            }
        }).then(r => {
            grouped[muscle] = r.data.data || [];
        })
    );

    await Promise.all(promises);

    // // Combine all exercises
    // let allExercises = [];
    // results.forEach(r => {
    //     if (r.data.data) allExercises.push(...r.data.data);
    // });

    res.status(200).json({
        status: 'success',
        data: grouped
    });
});

// *ask chatGPT for further improvements
exports.assignExercisesToMuscles = catchAsync(async (req, res, next) => {
    const exercisesId = req.body;

    // 1) Validate Inputs 
    if (!Array.isArray(exercisesId) || exercisesId.length === 0) return next(
        new AppError('Please send an array of exercises.', 400)
    );

    // 2) Turn exercises IDs into actual exercises
    const promises = exercisesId.map(id =>
        axios.get(`${process.env.EXERCISE_DB_URL}/api/v1/exercises/${id}`)
    );

    // Note: Promise.all(promises) waits for all of them (requests) to finish.
    const responses = await Promise.all(promises);

    // 3) Extract only exercises data
    const exercises = responses.map(r => {
        const ex = r.data.data;

        return {
            exerciseId: ex.exerciseId,
            name: ex.name,
            gifURL: ex.gifUrl,
            target: ex.targetMuscles[0],
            instructions: ex.instructions
        };
    });

    // 4) Update the database
    const workoutPlan = await WorkoutPlan.findOneAndUpdate({
        userId: req.user._id
    }, {
        exercises: exercises
    }, {
        new: true,
        upsert: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: workoutPlan
    });
});

exports.getCurrentUserWorkoutPlan = catchAsync(async (req, res, next) => {    
    const workoutPlan = await WorkoutPlan.findOne({userId: req.user._id});

    // Exercises will then be display to the UI for the users to edit

    res.status(200).json({
        status: 'success',
        data: workoutPlan
    });
});