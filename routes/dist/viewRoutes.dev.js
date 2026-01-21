"use strict";

var express = require("express");

var viewController = require("../controllers/viewController");

var authController = require("../controllers/authController");

var router = express.Router(); // Overview Page
// router.get('/')

router.get("/signup", authController.isLoggedIn, authController.redirectIfLoggedIn, viewController.signUp);
router.get("/login", authController.isLoggedIn, authController.redirectIfLoggedIn, viewController.login);
router.get("/forgotPassword", viewController.forgotPassword);
router.get('/reset-password/:token', viewController.resetPassword);
router.use(authController.protect);
router.get("/dashboard", authController.restrictTo("user"), viewController.dashboard);
router.get("/adminDashboard", authController.restrictTo("admin"), viewController.adminDashboard);
router.get("/coachDashboard", authController.restrictTo("coach"), viewController.coachDashboard);
module.exports = router;