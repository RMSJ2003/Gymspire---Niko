const express = require('express');

const userRouter = require('./routes/userRoutes');
const workoutSplitRoutes = require('./routes/workoutSplitRoutes');

const app = express();

app.use(express.json({
    limit: '10kb' // We set size for body so when the body is over 10kb, it will not be accepted.
}));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/workout-split', workoutSplitRoutes);

module.exports = app;