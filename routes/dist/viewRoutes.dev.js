"use strict";

var express = require('express');

var viewController = require('../controllers/viewController');

var authController = require('../controllers/authController');

var router = express.Router(); // Overview Page
// router.get('/')

router.get('/signup', viewController.signUp);
router.get('/login', viewController.login);
router.use(authController.protect);
router.get('/dashboard', viewController.dashboard);
module.exports = router;