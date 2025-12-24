const express = require('express');
const soloWorkoutSessionController = require('../controllers/soloWorkoutSessionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/musclesToWorkout')
    .get(soloWorkoutSessionController.getMusclesToWorkout)
    .post(soloWorkoutSessionController.setMusclesToWorkout); // this is where user already chosen muscles to worout the system will receive it

router
    .post('/:workoutLogId/start', soloWorkoutSessionController.startSoloWorkoutSession)

router
    .route('/:workoutLogId/exercises/:exerciseIndex/sets/:setNumber')
    .patch(soloWorkoutSessionController.updateWorkoutSet);

router.patch('/:workoutLogId/finish', soloWorkoutSessionController.finishWorkoutSession);

module.exports = router;