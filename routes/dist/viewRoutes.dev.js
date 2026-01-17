"use strict";

var express = require('express');

var viewController = require('../controllers/viewController');

var router = express.Router(); // Overview Page
// router.get('/')
// Sign up Page

router.get('/signup', viewController.signUp);
module.exports = router;