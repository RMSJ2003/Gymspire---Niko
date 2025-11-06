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
router
    .patch('/resetPassword/:token', authController.resetPassword);

// USED authController.protect -------------------------- START

router.use(authController.protect);

router.patch('/updateMe', userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;

// USED authController.protect -------------------------- END