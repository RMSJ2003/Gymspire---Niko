"use strict";

var express = require("express");

var adminController = require("../controllers/adminController");

var authController = require("../controllers/authController");

var router = express.Router();
router.use(authController.protect);
router.get("/gymspire-time", adminController.getGymspireTime);
router.get("/gym-usage", adminController.getGymUsageByHour);
router.get("/gym-time-recommendation", adminController.getRecommendedGymTime);
router.route("/createCoach").post(authController.restrictTo("admin"), authController.createCoach);
module.exports = router;