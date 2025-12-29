const express = require('express');

const userRouter = require('./routes/userRoutes');
const workoutPlanRouter = require('./routes/workoutPlanRoutes');
const soloWorkoutSessionRouter = require('./routes/soloWorkoutSessionRoutes');
const prRouter = require('./routes/prRoutes');
const sharedWorkoutSessionRouter = require('./routes/sharedWorkoutSessionRoutes');
const challengeLogRouter = require('./routes/challengeLogsRoutes');

const app = express();

app.use(express.json({
    limit: '10kb' // We set size for body so when the body is over 10kb, it will not be accepted.
}));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/workout-plans', workoutPlanRouter);
app.use('/api/v1/solo-workout-sessions', soloWorkoutSessionRouter);
app.use('/api/v1/prs', prRouter);
app.use('/api/v1/shared-workout-sessions', sharedWorkoutSessionRouter);
app.use('/api/v1/challenge-logs', challengeLogRouter);

module.exports = app;