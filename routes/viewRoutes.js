const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

// Overview Page
// router.get('/')

// Sign up Page
router.get('/signup', viewController.signUp);

module.exports = router;