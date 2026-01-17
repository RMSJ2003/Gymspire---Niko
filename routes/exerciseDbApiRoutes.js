const express = require('express');
const exerciseDbApiController = require('../controllers/exerciseDbApiController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(exerciseDbApiController.importApiExercises);

// router.get('/template', exerciseDbApiController.)

module.exports = router;