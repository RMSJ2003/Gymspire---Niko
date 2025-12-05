const express = require('express');
const workoutSplitController = require('../controllers/workoutSplitController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/create', workoutSplitController.createWorkoutSplit);

module.exports = router;