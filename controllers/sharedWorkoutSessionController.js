const systemExercises = require('../dev-data/data/systemExercises');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.test = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: {
            systemExercises
        }
    });
});