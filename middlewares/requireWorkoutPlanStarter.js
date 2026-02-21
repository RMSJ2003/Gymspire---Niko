const WorkoutPlan = require("../models/workoutPlanModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

module.exports = catchAsync(async (req, res, next) => {
  const workoutPlan = await WorkoutPlan.findOne({
    userId: req.user._id,
  }).populate("exerciseDetails");

  console.log(workoutPlan);

  // 🔥 IF NO WORKOUT PLAN → REDIRECT TO WORKOUT PLAN PAGE
  if (!workoutPlan) {
    return res.redirect("/createWorkoutPlan");
  }

  // It attaches data to the request object so the next middleware / controller can
  // reuse it
  req.workoutPlan = workoutPlan;

  next();
});
