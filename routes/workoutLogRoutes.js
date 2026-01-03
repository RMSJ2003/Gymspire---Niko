const express = require('express');
const workoutLogController = require('../controllers/workoutLogController');
const challengeController = require('../controllers/challengeController');
const authController = require('../controllers/authController');
const requireActiveChallenge = require('../middlewares/requireActiveChallenge');
const requireWorkoutPlan = require('../middlewares/requireWorkoutPlan');
const autoFinishStaleWorkouts = require('../middlewares/authFinishStaleWorkouts');

const router = express.Router();

router.use(authController.protect);

router
    .route('/challenge/:challengeId') // We asked for challengeId to know where to add the log
    .post(
        challengeController.getChallenge,
        requireActiveChallenge,
        autoFinishStaleWorkouts,
        workoutLogController.createMyChallengeWorkoutLog
    ); // Create a challenge log (Start challenge)

router
    .route('/solo')
    .post(
        requireWorkoutPlan,
        autoFinishStaleWorkouts,
        workoutLogController.createMySoloWorkoutLog
    )
    .get(workoutLogController.getMyWorkoutLogs);

router
    .route('/:workoutLogId/exercises/:exerciseIndex/sets/:setNumber')
    .patch(workoutLogController.updateMyWorkoutSet);

router.patch('/:workoutLogId/finish', workoutLogController.finishWorkoutLog);

module.exports = router;