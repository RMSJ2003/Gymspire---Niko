"use strict";

var Exercise = require('../models/exerciseModel');

var handlerFactory = require('../controllers/handlerFactory');

exports.getAllExercises = handlerFactory.getAll(Exercise);
exports.deleteAllExercises = handlerFactory.deleteAll(Exercise);