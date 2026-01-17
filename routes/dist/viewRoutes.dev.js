"use strict";

var express = require('express');

var viewController = require('../controllers/viewController');

var router = express.Router(); // Overview Page
// router.get('/')

router.get('/signup', viewController.signUp);
router.get('/login', viewController.login);
module.exports = router;