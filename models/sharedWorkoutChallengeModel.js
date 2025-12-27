const mongoose = require('mongoose');

const sharedWorkoutChallengeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    joinCode: {
        type: String,
        unique: true,
        required: true
    },
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
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'finished'],
        default: 'upcoming'
    },
    exercises: [
        {
            name: String,
            target: String
        }
    ]
});

const SharedWorkoutChallenge = mongoose.model('SharedWorkoutChallenge', sharedWorkoutChallengeSchema)
module.exports = SharedWorkoutChallenge;