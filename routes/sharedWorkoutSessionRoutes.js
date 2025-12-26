const express = require('express');
const sharedWorkoutSessionController = require('../controllers/sharedWorkoutSessionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/test', sharedWorkoutSessionController.test);

module.exports = router;

