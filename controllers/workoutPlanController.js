const mongoose = require("mongoose");
const WorkoutPlan = require("../models/workoutPlanModel");
const Exercise = require("../models/exerciseModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createMyWorkoutPlan = catchAsync(async (req, res, next) => {
  let { exerciseIds } = req.body;

  // 0️⃣ Must be a non-empty array
  if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
    return next(new AppError("exerciseIds must be a non-empty array", 400));
  }

  // 1️⃣ Remove duplicates
  exerciseIds = [...new Set(exerciseIds)];

  // 2️⃣ Validate format (ExerciseDB IDs are strings)
  const invalidFormatIds = exerciseIds.filter(
    (id) => typeof id !== "string" || id.trim() === "",
  );

  if (invalidFormatIds.length > 0) {
    return next(
      new AppError(
        `Invalid exerciseIds format: ${invalidFormatIds.join(", ")}`,
        400,
      ),
    );
  }

  // 3️⃣ Fetch exercises using exerciseId
  const exercisesFromDb = await Exercise.find({
    exerciseId: { $in: exerciseIds },
  });

  // 4️⃣ Validate existence
  const foundIds = exercisesFromDb.map((ex) => ex.exerciseId);
  const notFoundIds = exerciseIds.filter((id) => !foundIds.includes(id));

  if (notFoundIds.length > 0) {
    return next(
      new AppError(`ExerciseIds not found: ${notFoundIds.join(", ")}`, 400),
    );
  }

  // ✅ REMOVED: duplicate target (muscle group) restriction
  // Users can now add multiple exercises per muscle group.

  // 5️⃣ Guard: one workout plan per user
  const existingWorkoutPlan = await WorkoutPlan.findOne({
    userId: req.user._id,
  });

  if (existingWorkoutPlan) {
    return next(new AppError("You already have a workout plan.", 400));
  }

  // 6️⃣ Create workout plan
  const newWorkoutPlan = await WorkoutPlan.create({
    userId: req.user._id,
    exerciseIds,
  });

  res.status(201).json({
    status: "success",
    data: newWorkoutPlan,
  });
});

exports.getMyWorkoutPlan = catchAsync(async (req, res, next) => {
  const workoutPlan = req.workoutPlan;

  res.status(200).json({
    status: "success",
    data: workoutPlan,
  });
});

exports.updateMyWorkoutPlan = catchAsync(async (req, res, next) => {
  let { exerciseIds } = req.body;

  // 0) Validate input
  if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
    return next(new AppError("Please provide an array of exerciseIds", 400));
  }

  // 1) Normalize & dedupe
  exerciseIds = [...new Set(exerciseIds.map(String))];

  // 2) Fetch exercises by exerciseId
  const exercisesFromDb = await Exercise.find({
    exerciseId: { $in: exerciseIds },
  });

  // 3) Validate existence
  const foundIds = exercisesFromDb.map((ex) => ex.exerciseId);
  const notFoundIds = exerciseIds.filter((id) => !foundIds.includes(id));

  if (notFoundIds.length > 0) {
    return next(
      new AppError(`ExerciseIds not found: ${notFoundIds.join(", ")}`, 400),
    );
  }

  // ✅ REMOVED: duplicate target (muscle group) restriction
  // Users can now add multiple exercises per muscle group.

  // 4) Update workout plan
  const updatedWorkoutPlan = await WorkoutPlan.findOneAndUpdate(
    { userId: req.user._id },
    { exerciseIds },
    { new: true, runValidators: true },
  );

  if (!updatedWorkoutPlan) {
    return next(new AppError("Workout plan not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedWorkoutPlan,
  });
});

exports.deleteMyWorkoutPlan = catchAsync(async (req, res, next) => {
  await WorkoutPlan.deleteOne({ userId: req.user._id });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.acquireMyWorkoutPlan = catchAsync(async (req, res, next) => {
  const workoutPlan = await WorkoutPlan.findOne({
    userId: req.user._id,
  }).populate("exerciseDetails");

  if (!workoutPlan) {
    req.message =
      "You do not have a workout plan yet. Please create one first.";
    return next();
  }

  req.workoutPlan = workoutPlan;
  next();
});
