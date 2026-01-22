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
.post(challengeController.getChallenge, requireActiveChallenge, autoFinishStaleWorkouts, workoutLogController.createMyChallengeWorkoutLog); // Create a challenge log (Start challenge)

router.route('/solo').post(requireWorkoutPlan, autoFinishStaleWorkouts, workoutLogController.createMySoloWorkoutLog).get(workoutLogController.getMyWorkoutLogs);
router.get('/:id', requireWorkoutPlan, workoutLogController.getMyWorkoutLog);
router.route('/:workoutLogId/exercises/:exerciseIndex/sets/:setNumber').patch(workoutLogController.updateMyWorkoutSet);
router.patch('/:workoutLogId/finish', workoutLogController.finishWorkoutLog);
router.use(authController.restrictTo('coach'));
router.get('/:challengeId/submissions', workoutLogController.getSubmissions);
router.route('/:workoutLogId/verify').patch(workoutLogController.verifyChallengeWorkoutLog);
module.exports = router;