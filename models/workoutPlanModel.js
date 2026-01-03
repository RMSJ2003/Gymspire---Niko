const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    exercises: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Exercise'
    }]
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// exerciseDetails is just a name of the virtual populate
workoutPlanSchema.virtual('exerciseDetails', {
    ref: 'Exercise',
    localField: 'exercises',    // WorkoutPlan.exercises (array of ObjectIds)
    foreignField: '_id'         // Exercise._id
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
module.exports = WorkoutPlan;