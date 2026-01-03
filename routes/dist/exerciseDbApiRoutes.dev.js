"use strict";

var express = require('express');

var exerciseDbApiController = require('../controllers/exerciseDbApiController');

var router = express.Router();
router.route('/').get(exerciseDbApiController.importApiExercises);
module.exports = router;