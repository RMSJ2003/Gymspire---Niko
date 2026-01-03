const WorkoutLog = require('../models/workoutLogModel');
const AppError = require('../utils/appError');

module.exports = async (userId) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);

    const existingWorkout = await WorkoutLog.findOne({
        userId,
        date: {
            $gte: startOfToday,
            $lt: endOfToday
        }
    });

    if (existingWorkout) {
        throw new AppError(
            'You already have a workout logged today. You can only do one workout per day.',
            409
        );
    }
};