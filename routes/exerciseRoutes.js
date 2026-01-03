const express = require('express');
const exerciseController = require('../controllers/exerciseController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(exerciseController.getAllExercises)
    .delete(exerciseController.deleteAllExercises);

module.exports = router;