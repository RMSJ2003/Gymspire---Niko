"use strict";

var express = require("express");

var userController = require("../controllers/userController");

var authController = require("../controllers/authController");

var router = express.Router(); // USED authController.protect -------------------------- START
// Only logged in user can access these routes:

router.use(authController.protect);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);
router["delete"]("/deleteMe", userController.deleteMe);
router.route("/").get(userController.getAllUsers);
router.patch('/updateMyPhoto', userController.uploadUserPhoto, userController.updateProfilePhoto);
router.route("/:id").get(userController.getUser).patch(userController.updateUser)["delete"](userController.deleteUser);
router.route("/:id/role").patch(authController.restrictTo("admin"), userController.updateUserRole);
module.exports = router; // USED authController.protect -------------------------- END