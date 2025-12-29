const express = require('express');
const challengeLogController = require('../controllers/challengeLogController'); 
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// router
//     .route('/');

router
    .route('/:challengeId') 
    .post(challengeLogController.createChallengeLog); // Create a challenge log (Start challenge)

module.exports = router;