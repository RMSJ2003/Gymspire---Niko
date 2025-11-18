const mongoose = require('mongoose');

const workoutSplitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    split: [
        {
            day: { type: Number, required: true},
            workouts: [
                {
                    workoutName: { type: String, required: true },
                    formGifUrl: { type: String, required: true },
                    targetMuscle: { type: String, required: true },
                    sets: { type: Number, required: true },
                    minReps: { type: Number, required: true },
                    maxReps: { type: Number, required: true }
                }
            ]
        }
    ]
});

const WorkoutSplit = mongoose.model('WorkoutSplit', workoutSplitSchema);

module.exports = WorkoutSplit;