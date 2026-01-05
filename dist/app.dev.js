"use strict";

var express = require('express');

var userRouter = require('./routes/userRoutes');

var workoutPlanRouter = require('./routes/workoutPlanRoutes');

var prRouter = require('./routes/prRoutes');

var challengeRouter = require('./routes/challengeRoutes');

var workoutLogRouter = require('./routes/workoutLogRoutes');

var exerciseDbApiRouter = require('./routes/exerciseDbApiRoutes');

var exerciseRouter = require('./routes/exerciseRoutes');

var adminRouter = require('./routes/adminRoutes');

var app = express();
app.use(express.json({
  limit: '10kb' // We set size for body so when the body is over 10kb, it will not be accepted.

}));
app.use('/api/v1/users', userRouter);
app.use('/api/v1/workout-plans', workoutPlanRouter);
app.use('/api/v1/prs', prRouter);
app.use('/api/v1/challenges', challengeRouter);
app.use('/api/v1/workout-logs', workoutLogRouter);
app.use('/api/v1/exercise-db-api', exerciseDbApiRouter);
app.use('/api/v1/exercises', exerciseRouter);
app.use('/api/v1/admin', adminRouter);
module.exports = app;
/*

const axios = require('axios');
const WorkoutPlan = require('../models/workoutPlanModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const systemMuscles = ["pectorals", "upper back", "delts", "triceps", "biceps", "forearms", "abs", "quads",
    "hamstrings", "glutes", "calves"
];

// *the exercise will be displayed for users to choose exercises per each muscle group. 
exports.getAllExercises = catchAsync(async (req, res, next) => {
    const baseURL = `${process.env.EXERCISE_DB_URL}/api/v1/exercises/filter`;

    const grouped = {};

    const promises = systemMuscles.map(muscle =>
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

exports.upsertExercise = catchAsync(async (req, res, next) => {
    const {
        exerciseId
    } = req.params;
    const {
        target
    } = req.body;

    // 1) Validate target
    if (!systemMuscles.includes(target)) {
        return next(new AppError(`Invalid muscle target: ${target}`, 400));
    }

    // 2) Validate exercise exists (Exercise DB)
    let exerciseFromApi;

    try {
        const response = await axios.get(
            `${process.env.EXERCISE_DB_URL}/api/v1/exercises/${exerciseId}`
        );
        exerciseFromApi = response.data.data;
    } catch (err) {
        if (err.response?.status === 404) {
            return next(new AppError('No exercise found with that ID', 404));
        }
        return next(err);
    }

    // 3) Find user's workout plan (or create one)
    let workoutPlan = await WorkoutPlan.findOne({
        userId: req.user._id
    });

    if (!workoutPlan) {
        workoutPlan = await WorkoutPlan.create({
            userId: req.user._id,
            exercises: []
        });
    }

    // 4) Prepare exercise object
    const exercise = {
        exerciseId: exerciseFromApi.exerciseId,
        name: exerciseFromApi.name,
        gifURL: exerciseFromApi.gifUrl,
        target,
        instructions: exerciseFromApi.instructions
    };

    // 5) Upsert exercise by target
    const existingIndex = workoutPlan.exercises.findIndex(
        ex => ex.target === target
    );

    if (existingIndex !== -1) {
        // 🔁 Replace existing exercise for that muscle
        workoutPlan.exercises[existingIndex] = exercise;
    } else {
        // ➕ Add new exercise
        workoutPlan.exercises.push(exercise);
    }

    // 6) Save (schema validation runs here)
    await workoutPlan.save();

    // 7) Send response
    res.status(200).json({
        status: 'success',
        data: workoutPlan
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
    const workoutPlan = await WorkoutPlan.findOne({
        userId: req.user._id
    });

    // Exercises will then be display to the UI for the users to edit

    res.status(200).json({
        status: 'success',
        data: workoutPlan
    });
});
*/