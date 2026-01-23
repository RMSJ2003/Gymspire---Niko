const Exercise = require("../models/exerciseModel");
const handlerFactory = require("../controllers/handlerFactory");
const catchAsync = require("../utils/catchAsync");

exports.getAllExercises = handlerFactory.getAll(Exercise);

exports.deleteAllExercises = handlerFactory.deleteAll(Exercise);

// Without json
exports.acquireAllExericses = catchAsync(async (req, res, next) => {
  const exercises = await Exercise.find();
  req.exercises = exercises;

  next();
});
