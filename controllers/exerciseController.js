const Exercise = require('../models/exerciseModel');
const handlerFactory = require('../controllers/handlerFactory');

exports.getAllExercises = handlerFactory.getAll(Exercise);

exports.deleteAllExercises = handlerFactory.deleteAll(Exercise);