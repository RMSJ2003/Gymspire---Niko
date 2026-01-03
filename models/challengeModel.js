const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    joinCode: {
        type: String,
        unique: true,
        required: true
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
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
challengeSchema.virtual('exerciseDetails', {
    ref: 'Exercise',
    localField: 'exercises', // Challenge.exercises (array of ObjectIds)
    foreignField: '_id' // Exercise._id
});

const Challenge = mongoose.model('Challenge', challengeSchema)
module.exports = Challenge;