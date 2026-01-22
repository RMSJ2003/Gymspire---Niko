"use strict";

var express = require("express");

var challengeController = require("../controllers/challengeController");

var authController = require("../controllers/authController");

var requireWorkoutPlan = require("../middlewares/requireWorkoutPlan");

var requireActiveChallenge = require("../middlewares/requireActiveChallenge");

var router = express.Router();
router.use(authController.protect);
router.post("/:joinCode/join", requireWorkoutPlan, challengeController.getChallenge, requireActiveChallenge, challengeController.joinChallenge);
router.get("/:challengeId", requireWorkoutPlan, challengeController.getChallenge, challengeController.getgetChallenge);
router.route("/").post( // Create challenge: exerciseIds sent via body
authController.restrictTo("coach"), challengeController.createChallenge).get(challengeController.getAllChallenges);
router.route("/:challengeId/leaderboard").get(challengeController.getLeaderboard);
module.exports = router;