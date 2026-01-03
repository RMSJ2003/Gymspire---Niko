"use strict";

var mongoose = require('mongoose');

var workoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  workoutPlanId: {
    type: mongoose.Schema.ObjectId,
    ref: 'WorkoutPlan'
  },
  challengeId: {
    // Either solo workout or challenge workout. A log can only have a workoutPlanId OR
    // challengeId
    type: mongoose.Schema.ObjectId,
    ref: 'SharedWorkoutChallenge'
  },
  date: {
    type: Date,
    "default": Date.now()
  },
  status: {
    type: String,
    "enum": ['not yet started', 'ongoing', 'done'],
    "default": 'ongoing'
  },
  videoUrl: {
    type: String,
    required: function required() {
      // required ONLY if this is a challenge workout
      return !!this.challengeId && this.status === 'done';
    },
    validate: {
      validator: function validator(v) {
        // If challengeId exists, videoUrl must be a non-empty string
        if (this.challengeId) {
          return typeof v === 'string' && v.trim().length > 0;
        }

        return true;
      },
      message: 'videoUrl is required for challenge workouts'
    }
  },
  exercises: [{
    name: {
      type: String,
      required: true
    },
    target: {
      type: String,
      required: true
    },
    gifURL: {
      type: String,
      required: true
    },
    set: [{
      setNumber: {
        type: Number,
        required: true,
        min: [1, 'Set Number must be 1 to 6'],
        max: [6, 'Set Number must be 1 to 6']
      },
      type: {
        type: String,
        "enum": ['warmup', 'working'],
        validate: {
          validator: function validator(v) {
            // only require type for NEW structured workouts
            return v !== undefined;
          },
          message: 'A set must have a type (warmup or working)'
        }
      },
      weight: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        "enum": ['LB', 'KG'],
        "default": 'LB',
        required: true
      },
      reps: {
        type: Number,
        required: true,
        validate: [{
          validator: Number.isInteger,
          message: 'Reps must be a whole number'
        }, {
          validator: function validator(v) {
            // allow 0 ONLY before workout starts
            if (v === 0) return true;

            if (this.type === 'warmup') {
              return v === 4;
            }

            if (this.type === 'working') {
              return v >= 8 && v <= 12;
            }

            return true;
          },
          message: 'Invalid number of reps for this set type'
        }]
      },
      restSeconds: {
        type: Number,
        validate: {
          validator: function validator(v) {
            return v !== undefined;
          },
          message: 'A set must have a restSeconds (rest duration in seconds)'
        }
      }
    }]
  }]
}); // Ensure each exercise has unique set numbers

workoutLogSchema.path('exercises').validate(function (exercises) {
  return exercises.every(function (ex) {
    var setNumbers = ex.set.map(function (s) {
      return s.setNumber;
    });
    return setNumbers.length === new Set(setNumbers).size;
  });
}, 'Duplicate setNumber found. Each setNumber must be unique per exercise.');
var WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);
module.exports = WorkoutLog;