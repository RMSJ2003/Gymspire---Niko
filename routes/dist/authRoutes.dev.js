"use strict";

var express = require("express");

var authController = require("../controllers/authController");

var router = express.Router();
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.get("/logout", authController.protect, authController.logout);
module.exports = router;