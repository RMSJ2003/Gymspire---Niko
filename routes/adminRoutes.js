const express = require("express");
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.get("/gymspire-time", adminController.getGymspireTime);

router.get("/gym-usage", adminController.getGymUsageByHour);

router.get("/get-gymspire-now-status", adminController.getGymspireNowStatus);

router
  .route("/createCoach")
  .post(authController.restrictTo("admin"), authController.createCoach);

module.exports = router;
