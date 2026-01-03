"use strict";

var express = require('express');

var exerciseController = require('../controllers/exerciseController');

var authController = require('../controllers/authController');

var router = express.Router();
router.use(authController.protect);
router.use(authController.restrictTo('admin'));
router.route('/').get(exerciseController.getAllExercises)["delete"](exerciseController.deleteAllExercises);
module.exports = router;