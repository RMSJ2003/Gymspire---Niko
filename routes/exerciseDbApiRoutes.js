const express = require('express');
const exerciseDbApiController = require('../controllers/exerciseDbApiController');

const router = express.Router();

router
    .route('/')
    .get(exerciseDbApiController.importApiExercises)

module.exports = router;