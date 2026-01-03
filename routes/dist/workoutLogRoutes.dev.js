"use strict";

var express = require('express');

var workoutLogController = require('../controllers/workoutLogController');

var challengeController = require('../controllers/challengeController');

var authController = require('../controllers/authController');

var requireActiveChallenge = require('../middlewares/requireActiveChallenge');

var requireWorkoutPlan = require('../middlewares/requireWorkoutPlan');

var autoFinishStaleWorkouts = require('../middlewares/authFinishStaleWorkouts');

var router = express.Router();
router.use(authController.protect);
router.route('/challenge/:challengeId') // We asked for challengeId to know where to add the log
.post(challengeController.getChallenge, requireActiveChallenge, autoFinishStaleWorkouts, workoutLogController.createChallengeWorkoutLog); // Create a challenge log (Start challenge)

router.route('/solo').post(requireWorkoutPlan, autoFinishStaleWorkouts, workoutLogController.createSoloWorkoutLog).get(workoutLogController.getMyWorkoutLogs);
router.route('/:workoutLogId/exercises/:exerciseIndex/sets/:setNumber').patch(workoutLogController.updateWorkoutSet);
router.patch('/:workoutLogId/finish', workoutLogController.finishWorkoutLog);
module.exports = router;