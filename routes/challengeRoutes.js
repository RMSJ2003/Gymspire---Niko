const express = require('express');
const challengeController = require('../controllers/challengeController');
const authController = require('../controllers/authController');
const requireWorkoutPlan = require('../middlewares/requireWorkoutPlan');
const requireActiveChallenge = require('../middlewares/requireActiveChallenge');

const router = express.Router();

router.use(authController.protect);

router.post(
    '/:joinCode',
    requireWorkoutPlan,
    challengeController.getChallenge,
    requireActiveChallenge,
    challengeController.joinChallenge
);

router.use(authController.restrictTo('admin', 'judge'));

router
    .route('/')
    .post( // Create challenge: exerciseIds sent via body
        challengeController.createChallenge
    )
    .get(challengeController.getAllChallenges);
    

module.exports = router;