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

  // ==========================
  // 🎥 VIDEO (ALWAYS OPTIONAL)
  // ==========================
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

  // ==========================
  // 🧑‍⚖️ JUDGING FIELDS (OPTIONAL)
  // ==========================
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

  // ==========================
  // 🏋️ EXERCISES
  // ==========================
  exercises: [
    {
      name: {
        type: String,
        required: true,
      },
      target: {
        type: String,
        required: true,
      },
      gifURL: {
        type: String,
        required: true,
      },
      set: [
        {
          setNumber: {
            type: Number,
            required: true,
            min: 1,
            max: 6,
          },

          type: {
            type: String,
            enum: ["warmup", "working"],
            required: true,
          },

          weight: {
            type: Number,
            required: true,
          },

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
              {
                validator: function (v) {
                  if (v === 0) return true;

                  if (this.type === "warmup") return v === 4;
                  if (this.type === "working") return v >= 8 && v <= 12;

                  return true;
                },
                message: "Working sets must be 8-12 reps",
              },
            ],
          },

          restSeconds: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  ],
});

// ==========================
// 🔒 VALIDATIONS
// ==========================

// Ensure unique set numbers per exercise
workoutLogSchema.path("exercises").validate(function (exercises) {
  return exercises.every((ex) => {
    const setNumbers = ex.set.map((s) => s.setNumber);
    return setNumbers.length === new Set(setNumbers).size;
  });
}, "Duplicate setNumber found per exercise");

// Ensure either solo OR challenge
workoutLogSchema.pre("validate", function (next) {
  if (this.workoutPlanId && this.challengeId) {
    return next(
      new AppError("WorkoutLog cannot have both workoutPlanId and challengeId"),
    );
  }

  if (!this.workoutPlanId && !this.challengeId) {
    return next(
      new AppError("WorkoutLog must have either workoutPlanId or challengeId"),
    );
  }

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

// ==========================
// 🧠 INSTANCE METHODS
// ==========================
workoutLogSchema.methods.isSolo = function () {
  return !!this.workoutPlanId && !this.challengeId;
};

workoutLogSchema.methods.isChallenge = function () {
  return !!this.challengeId;
};

// ==========================
const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);
module.exports = WorkoutLog;
// Write to Richard M. Sahagun
