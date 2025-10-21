const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .route('/signup')
    .post(authController.signup);

router
    .route('/login')
    .post(authController.login);

router
    .post('/forgotPassword', authController.forgotPassword);

// router
//     .post('/resetPassword/:token', authController.resetPassword);

router
    .route('/deleteMe', userController.deleteMe);

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
