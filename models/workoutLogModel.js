const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
    workoutPlanId: {
        type: mongoose.Schema.ObjectId,
        ref: 'WorkoutPlan',
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    status: {
        type: String,
        enum: ['ongoing', 'done'],
        default: 'ongoing'
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
        set: [{
            setNumber: {
                type: Number,
                required: true,
                min: [1, 'Set Number must be 1 to 3'],
                max: [3, 'Set Number must be 1 to 3'],
            },
            type: {
                type: String,
                enum: ['warmup', 'working'],
                validate: {
                    validator: function (v) {
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
                enum: ['LB', 'KG'],
                default: 'LB'
            },
            reps: {
                type: Number,
                required: true,
                min: [8, 'Reps must be 8 to 12'],
                max: [12, 'Reps must be 8 to 12'],
                // Add a rounding 
            },
            restSeconds: {
                type: Number,
                validate: {
                    validator: v => v !== undefined,
                    message: 'A set must have a restSeconds (rest duration in seconds)'
                }
            }
        }]
    }]
});

// Ensure each exercise has unique set numbers
workoutLogSchema.path('exercises').validate(function (exercises) {
    return exercises.every(ex => {
        const setNumbers = ex.set.map(s => s.setNumber);
        return setNumbers.length === new Set(setNumbers).size;
    });
}, 'Duplicate setNumber found. Each setNumber must be unique per exercise.');

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);
module.exports = WorkoutLog;