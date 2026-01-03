// WHY DID WE PUT THIS HERE?
/*

no response logic

no branching

always safe to run

applies to both solo & challenge

keeps controllers clean*/

const WorkoutLog = require('../models/workoutLogModel');
const catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(async (req, res, next) => {
    // Auto-finish stale ongoing workouts
    // Rule: Only ONE workout may be ongoing per user
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

    next();
});