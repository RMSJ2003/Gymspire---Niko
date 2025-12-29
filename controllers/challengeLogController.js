const WorkoutLog = require('../models/workoutLogModel');
const SharedWorkoutChallenge = require('../models/sharedWorkoutChallengeModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
    enforceMuscleRest
} = require('../services/restRule.service');

exports.createChallengeLog = catchAsync(async (req, res, next) => {
    const {
        challengeId
    } = req.params;

    // ================================
    // STEP 1: Fetch the challenge
    // - Ensure the challenge exists
    // - This is the base context for everything that follows
    // ================================
    const challenge = await SharedWorkoutChallenge.findOne({
        _id: challengeId
    });

    // ================================
    // STEP 2: Validate challenge is active
    // - Check current time is within startTime and endTime
    // - Prevent joining before start or after end
    // - Fail fast before doing any other checks
    // ================================
    const now = new Date();

    // Checks if the challenge has not started yet.
    if (now < challenge.startTime) return next(
        new AppError('Challenge not started yet', 409)
    );

    // Checks if the challenge has ended already
    if (now > challenge.endTime) return next(
        new AppError('Challenge has already ended', 409)
    );

    // ================================
    // STEP 3: Validate user is a participant
    // - Ensure the user joined the challenge
    // - Prevent unauthorized workout log creation
    // ================================
    const joined = challenge.participants.some(
        id => id.toString() === req.user._id.toString()
    );

    if (!joined) {
        return next(new AppError('You are not a participant of this challenge', 409));
    }

    // ================================
    // STEP 4: Check for existing challenge workout log in the challenge
    // - Ensure the user does NOT already have an ongoing
    //   workout log for this challenge
    // - Enforce "one active workout per challenge per user"
    // ================================
    // Look for an existing workout log for this user
    // tied to the same challenge that is NOT finished yet
    const existingChallengeLog = await WorkoutLog.findOne({
        userId: req.user._id,
        challengeId: challenge._id,
        status: {
            $ne: 'done'
        }
    });

    // If an active or not-yet-finished log exists,
    // block creation of a new challenge workout log
    if (existingChallengeLog) {
        return next(
            new AppError(
                'You already have an ongoing workout for this challenge',
                409
            )
        );
    }

    // ================================
    // STEP 5: Fetch challenge exercises (targets)
    // - Extract muscle targets from challenge.exercises
    // - These will be used for rest rule enforcement
    // ================================
    const challengeExercises = challenge.exercises
        .map(ex => ({
            name: ex.name,
            target: ex.target,
            set: []
            // we will semi populate the set with (prepare warm up sets and rest duration) 
        }));

    // Populate the sets
    challengeExercises.forEach(ex => {
        ex.set = [
            // Warm-ups
            {
                setNumber: 1,
                type: 'warmup',
                weight: 0,
                reps: 0,
                restSeconds: 60
            },
            {
                setNumber: 2,
                type: 'warmup',
                weight: 0,
                reps: 0,
                restSeconds: 60
            },
            {
                setNumber: 3,
                type: 'warmup',
                weight: 0,
                reps: 0,
                restSeconds: 180
            },

            // Working sets (3 sets, 4 min rest)
            {
                setNumber: 4,
                type: 'working',
                weight: 0,
                reps: 0,
                restSeconds: 240
            },
            {
                setNumber: 5,
                type: 'working',
                weight: 0,
                reps: 0,
                restSeconds: 240
            },
            {
                setNumber: 6,
                type: 'working',
                weight: 0,
                reps: 0,
                restSeconds: 240
            }
        ];
    });

    // ================================
    // STEP 6: Fetch user's most recent workout log
    // - Include both solo and challenge workouts
    // - This is needed for recovery validation
    // ================================
    const lastWorkoutLog = await WorkoutLog.findOne({
        userId: req.user._id
    }).sort({
        date: -1
    });


    // ================================
    // STEP 7: Enforce 24-hour muscle rest rule
    // - Compare challenge targets vs last workout muscles
    // - Block if recovery time has not passed
    // ================================
    // Extract the targets
    const challengeTargets = challengeExercises.map(ex => ex.target);

    console.log('challengeTargets: ', challengeTargets);

    try {
        enforceMuscleRest({
            lastWorkoutLog,
            targets: challengeTargets
        });
    } catch (err) {
        return next(new AppError(err.message, 409));
    }

    // ================================
    // STEP 8: Auto-finish old ongoing workout logs
    // - Ensure only one workout can be ongoing at a time
    // - Auto-mark stale logs as "done"
    // ================================
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await WorkoutLog.updateMany({
        userId: req.user._id,
        status: 'ongoing',
        date: {
            $lt: startOfToday
        }
    }, {
        $set: {
            status: 'done'
        }
    });

    // ================================
    // STEP 9: Create the challenge workout log
    // - Attach challengeId
    // - Attach userId
    // - Initialize exercises from challenge
    // - Set status to "not yet started"
    // ================================
    const newChallengeLog = await WorkoutLog.create({
        userId: req.user._id,
        challengeId: challenge._id,
        status: 'ongoing',
        exercises: challengeExercises
    }); 

    // ================================
    // STEP 10: Send success response
    // - Return created workout log metadata
    // ================================

    res.status(200).json({
        status: 'success',
        data: newChallengeLog
    });
});

// DELETE THIS
/*
// ================================
// STEP 1: Auto-finish old ongoing workout logs
// Rule: Only one ongoing workout logs may exist
// ================================


// ================================
// STEP 2: Fetch most recent workout
// (solo OR challenge)
// ================================
const lastWorkoutLog = await WorkoutLog.findOne({
    userId: req.user._id
}).sort({
    date: -1
});

// ================================
// STEP 3: Enforce 24-hour muscle rest rule
// Uses shared domain service
// ================================
try {
    enforceMuscleRest({
        lastWorkoutLog,
        targets
    });
} catch (err) {
    return next(new AppError(err.message, 409));
}

// ================================
// STEP 4: Fetch the challenge
// ================================

const challenge = SharedWorkoutChallenge.findOne({
    _id: req.params.challengeId
});

// ================================
// STEP 5: Get exercises from the challenge
// ================================

const challengeExercises = challenge.exercises
    .map(ex => ({
        name: ex.name,
        target: ex.target,
    }));




// Remove this:
// const selectedExercises = req.workoutPlan.exercises
//     .filter(ex => targets.includes(ex.target))
//     .map(ex => ({
//         name: ex.name,
//         target: ex.target,
//         set: []
//     }));

// if (!selectedExercises.length) {
//     return next(
//         new AppError('No matching exercises found for selected muscles', 400)
//     );
// }

*/