const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const adminController = require('../controllers/adminController');

const router = express.Router();

// Overview Page
// router.get('/')

router.get(
  "/signup",
  authController.isLoggedIn,
  authController.redirectIfLoggedIn,
  viewController.signUp
);

router.get(
  "/login",
  authController.isLoggedIn,
  authController.redirectIfLoggedIn,
  viewController.login
);

router.get("/forgotPassword", viewController.forgotPassword);
router.get('/reset-password/:token', viewController.resetPassword);

// router.use(authController.protect); // Do not put this here cuz it will 
// also protect the unknwon routes e.g. /sdafasdf then it will say 
// 'You are not logged in. Please log in' we don't want that.

router.get(
  "/dashboard",
  authController.protect,
  authController.restrictTo("user"),
  adminController.getGymspireNowStatus,
  viewController.dashboard
);

router.get(
  "/adminDashboard",
  authController.protect,
  authController.restrictTo("admin"),
  viewController.adminDashboard
);

router.get(
  "/coachDashboard",
  authController.protect,
  authController.restrictTo("coach"),
  viewController.coachDashboard
);

router.get(
  "/profile",
  authController.protect,
  viewController.profile
);

router.get(
  "/workoutPlan",
  authController.protect,
  viewController.workoutPlan
);

router.get(
  "/challenges",
  authController.protect,
  viewController.challenges
);

router.get(
  "/workoutLogs",
  authController.protect,
  viewController.workoutLogs
);

router.get(
  "/startSoloWorkout",
  authController.protect,
  viewController.startSoloWorkout
);

module.exports = router;
