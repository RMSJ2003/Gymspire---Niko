"use strict";

var express = require("express");

var authController = require("../controllers/authController");

var userController = require('../controllers/userController');

var router = express.Router();
router.route("/signup").post(userController.uploadUserPhoto, authController.signup);
router.route("/login").post(authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.get("/logout", authController.protect, authController.logout);
module.exports = router;