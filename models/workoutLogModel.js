const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const workoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  workoutPlanId: {
    type: mongoose.Schema.ObjectId,
    ref: "WorkoutPlan",
  },

  challengeId: {
    type: mongoose.Schema.ObjectId,
    ref: "Challenge",
  },

  date: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ["not yet started", "ongoing", "done"],
    default: "ongoing",
  },

  videoUrl: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return typeof v === "string" && v.trim().length > 0;
      },
      message: "videoUrl must be a valid string if provided",
    },
  },

  judgeStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  judgeNotes: {
    type: String,
    trim: true,
  },

  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  strengthScore: {
    type: Number,
    default: 0,
  },

  exercises: [
    {
      name: { type: String, required: true },
      target: { type: String, required: true },
      gifURL: { type: String, required: true },
      set: [
        {
          setNumber: {
            type: Number,
            required: true,
            min: 1,
          },

          type: {
            type: String,
            enum: ["warmup", "working"],
            required: true,
          },

          weight: { type: Number, required: true },

          unit: {
            type: String,
            enum: ["LB", "KG"],
            default: "LB",
          },

          reps: {
            type: Number,
            required: true,
            validate: [
              {
                validator: Number.isInteger,
                message: "Reps must be a whole number",
              },
            ],
          },

          restSeconds: { type: Number, required: true },
        },
      ],
    },
  ],
});

// ✅ REMOVED: duplicate setNumber validator
// It fired on every .save() because Mongoose re-validates the entire
// exercises array before the mutation is fully committed, causing false
// "Duplicate setNumber" errors on add, remove, and bulk update.
// Set number integrity is enforced by the controller logic instead.

// Ensure either solo OR challenge — never both, never neither
workoutLogSchema.pre("validate", function (next) {
  if (this.workoutPlanId && this.challengeId)
    return next(
      new AppError("WorkoutLog cannot have both workoutPlanId and challengeId"),
    );
  if (!this.workoutPlanId && !this.challengeId)
    return next(
      new AppError("WorkoutLog must have either workoutPlanId or challengeId"),
    );
  next();
});

// Remove challenge-only fields for solo workouts
workoutLogSchema.pre("validate", function (next) {
  if (this.workoutPlanId && !this.challengeId) {
    this.challengeId = undefined;
    this.videoUrl = undefined;
    this.judgeStatus = undefined;
    this.judgeNotes = undefined;
    this.verifiedBy = undefined;
    this.strengthScore = undefined;
  }
  next();
});

workoutLogSchema.methods.isSolo = function () {
  return !!this.workoutPlanId && !this.challengeId;
};

workoutLogSchema.methods.isChallenge = function () {
  return !!this.challengeId;
};

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);
module.exports = WorkoutLog;
// Write to Richard M. Sahagun
