const mongoose = require("mongoose");

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    exerciseIds: {
      type: [String], // 🔥 ExerciseDB IDs
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 🔥 Virtual populate using exerciseId
workoutPlanSchema.virtual("exerciseDetails", {
  ref: "Exercise",
  localField: "exerciseIds", // ✅ FIXED
  foreignField: "exerciseId",
});

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
module.exports = WorkoutPlan;
