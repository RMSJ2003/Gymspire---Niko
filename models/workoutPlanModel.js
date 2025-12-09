const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    exercises: [
        {
            name: { type: String, required: true }, 
            gifUrl: { type: String, required: true },
            targetMuscle: { type: String, required: true},
            instructions: { type: [String], required: true}
        }
    ]
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

module.exports = WorkoutPlan;