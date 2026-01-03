/*

NOTES: Why didn't I put this file in utils or services

❌ NOT in utils

Because:

it throws HTTP errors

it uses next()

❌ NOT in services

Because:

services should not know about Express

✅ YES — middleware

This is a gatekeeper rule.

*/

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(async (req, res, next) => {
    const {
        challenge
    } = req; // assumes challenge is already loaded

    const now = new Date();

    // Challenge has not started yet
    if (now < challenge.startTime) {
        return next(
            new AppError('Challenge not started yet', 409)
        );
    }

    // Challenge has already ended
    if (now > challenge.endTime) {
        return next(
            new AppError('Challenge has already ended', 409)
        );
    }

    next();
});