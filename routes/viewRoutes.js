const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

// Overview Page
// router.get('/')

router.get('/signup', viewController.signUp);

router.get('/login', viewController.login)

module.exports = router;