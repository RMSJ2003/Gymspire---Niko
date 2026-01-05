"use strict";

var express = require("express");

var adminController = require("../controllers/adminController");

var authController = require("../controllers/authController");

var router = express.Router();
router.use(authController.protect);
router.use(authController.restrictTo("admin"));
router.get('/gymspire-time', adminController.getGymspireTime);
router.get('/gym-usage', adminController.getGymUsageByHour);
router.get('/gym-time-recommendation', adminController.getRecommendedGymTime);
module.exports = router;