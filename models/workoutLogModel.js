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
                required: true
            },
            weight: {
                type: Number,
                required: true
            },
            reps: {
                type: Number,
                required: true
            },
        }]
    }]
});