const express = require('express');
const prController = require('../controllers/prController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/exercise/:exerciseName', prController.getExercisePR);

module.exports = router;