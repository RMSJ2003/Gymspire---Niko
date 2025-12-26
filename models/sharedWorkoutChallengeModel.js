const mongoose = require('mongoose');

const sharedWorkoutChallengeSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date, 
        required: true
    },
    exercises: [
        {
            name: String,
            target: String
        }
    ],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'finished'],
        default: 'upcoming'
    }
});

const SharedWorkoutChallenge = mongoose.model('SharedWorkoutChallenge', sharedWorkoutChallengeSchema)
module.exports = SharedWorkoutChallenge;