const express = require("express");
const clinicController = require("../controllers/clinicController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo("clinic")); // 🔥 only clinic can approve

router.patch("/approve/:id", clinicController.approveUser);
router.patch("/decline/:id", clinicController.declineUser);

module.exports = router;
