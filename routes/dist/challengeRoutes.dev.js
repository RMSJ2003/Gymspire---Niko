"use strict";

var express = require('express');

var challengeController = require('../controllers/challengeController');

var authController = require('../controllers/authController');

var requireWorkoutPlan = require('../middlewares/requireWorkoutPlan');

var requireActiveChallenge = require('../middlewares/requireActiveChallenge');

var router = express.Router();
router.use(authController.protect);
router.post('/:joinCode', requireWorkoutPlan, challengeController.getChallenge, requireActiveChallenge, challengeController.joinChallenge);
router.route('/').post( // Create challenge: exerciseIds sent via body
authController.restrictTo('judge'), challengeController.createChallenge).get(challengeController.getAllChallenges);
module.exports = router;