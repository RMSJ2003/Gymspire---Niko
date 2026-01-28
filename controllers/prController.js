const WorkoutLog = require("../models/workoutLogModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getExercisePR = catchAsync(async (req, res, next) => {
  const { exerciseName } = req.params;

  // 1) Aggregate
  const records = await WorkoutLog.aggregate([
    {
      $match: {
        userId: req.user._id,
        status: "done",
      },
    },
    { $unwind: "$exercises" },
    {
      $match: {
        "exercises.name": exerciseName,
      },
    },
    { $unwind: "$exercises.set" },
    {
      $match: {
        "exercises.set.type": "working",
      },
    },
    {
      $sort: {
        "exercises.set.weight": -1,
        "exercises.set.reps": -1,
      },
    },
    { $limit: 1 }, // This makes this only return ONE (the PR) document
    {
      $project: {
        _id: 0,
        exercise: "$exercises.name",
        weight: "$exercises.set.weight",
        reps: "$exercises.set.reps",
        unit: "$exercises.set.unit",
        date: "$date",
      },
    },
  ]);

  if (!records.length)
    return next(new AppError("No records found for this exercise", 404));

  res.status(200).json({
    status: "success",
    data: records[0],
  });
});
