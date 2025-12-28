const express = require('express');
const sharedWorkoutSessionController = require('../controllers/sharedWorkoutSessionController');
const authController = require('../controllers/authController');
const requireWorkoutPlan = require('../middlewares/requireWorkoutPlan');

const router = express.Router();

router.use(authController.protect);

router.post(
    '/:joinCode',
    requireWorkoutPlan,
    sharedWorkoutSessionController.joinChallenge
);

router
    .route('/')
    .post( // Create challenge: target muscles sent via body
        authController.restrictTo('admin', 'judge'),
        sharedWorkoutSessionController.createChallenge
    );

module.exports = router;