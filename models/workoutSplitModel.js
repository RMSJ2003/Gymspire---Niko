const mongoose = require('mongoose');

const workoutSplitSchema = new mongoose.Schema({
    userId: { // One-to-one relationship with user schema
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A workout split must belong to a user.']
    },
    totalDays: {
        type: Number, 
        required: [true, 'Please select how many workout days per week.'],
        min: 1,
        max: 7
    },
    split: [
        {
            day: { type: Number, required: [true, 'A workout session must have a day assigned to it']},
            workouts: [
                {
                    workoutName: { type: String, required: [true, 'A workout must have a workout name.'] },
                    formGifUrl: { type: String, required: [true, 'A workout must have a form GIF URL.'] },
                    targetMuscle: { type: String, required: [true, 'A workout must have a target muscle.'] },
                    sets: { type: Number, required: [true, 'A workout must have a number of sets.'] },
                    minReps: { type: Number, required: [true, 'A workout must have a minimum reps.'] },
                    maxReps: { type: Number, required: [true, 'A workout must have a maximum reps.'] }
                }
            ]
        }
    ]
});

const WorkoutSplit = mongoose.model('WorkoutSplit', workoutSplitSchema);

module.exports = WorkoutSplit;