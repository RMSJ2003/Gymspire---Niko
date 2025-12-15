const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    exercises: [{
        name: {
            type: String,
            required: true
        },
        gifUrl: {
            type: String,
            required: true
        },
        target: {
            type: String,
            required: true
        },
        instructions: {
            type: [String],
            required: true
        }
    }]
});

// ✅ Validate NO duplicate "target" muscles
workoutPlanSchema.path('exercises').validate(function (exercises) {
    const targets = exercises.map(ex => ex.target);
    const uniqueTargets = new Set(targets);

    return targets.length === uniqueTargets.size; // true if no duplicates
}, 'Each muscle can only have ONE assigned exercise.');

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
module.exports = WorkoutPlan;