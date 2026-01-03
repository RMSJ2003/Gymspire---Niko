"use strict";

var express = require('express');

var exerciseDbApiController = require('../controllers/exerciseDbApiController');

var authController = require('../controllers/authController');

var router = express.Router();
router.use(authController.protect);
router.use(authController.restrictTo('admin'));
router.route('/').get(exerciseDbApiController.importApiExercises); // router.get('/template', exerciseDbApiController.)

module.exports = router;