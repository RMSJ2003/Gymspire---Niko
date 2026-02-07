const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router
  .route("/signup")
  .post(userController.uploadUserPhoto, authController.signup);
router.route("/login").post(authController.login);

router.get("/verify-email/:token", authController.verifyIacademyEmail);

router.post(
  "/requestEmailVerification",
  authController.requestEmailVerification,
);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.post("/reactivateAccount", authController.reactivateAccount);

router.get("/logout", authController.protect, authController.logout);

module.exports = router;
