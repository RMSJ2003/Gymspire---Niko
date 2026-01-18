const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

// Overview Page
// router.get('/')

router.get('/signup', viewController.signUp);

router.get('/login', viewController.login)

router.use(authController.protect);

router.get('/dashboard', viewController.dashboard);

module.exports = router;