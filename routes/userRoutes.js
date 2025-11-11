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
// Only logged in user can access these routes:

router.use(authController.protect);

router.get(
    '/me', 
    userController.getMe,
    userController.getUser
);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.post('/sendFriendRequest/:friendId', userController.sendFriendRequest);
router.patch('/acceptFriendRequest/:requesterId', userController.acceptFriendRequest);
router.patch('/declineFriendRequest/:requesterId', userController.declineFriendRequest);
router.delete('/removeFriend/:friendId', userController.removeFriend);

router.get('/getOnlineFriends', userController.getOnlineFriends);

router
    .route('/message/:friendId')
    .get(userController.getMessages)
    .post(userController.sendMessage);

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