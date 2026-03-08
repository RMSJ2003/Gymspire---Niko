const express = require("express");
const workoutLogController = require("../controllers/workoutLogController");
const challengeController = require("../controllers/challengeController");
const authController = require("../controllers/authController");
const requireActiveChallenge = require("../middlewares/requireActiveChallenge");
const requireWorkoutPlan = require("../middlewares/requireWorkoutPlan");
const userController = require("../controllers/userController");
const autoFinishStaleWorkouts = require("../middlewares/authFinishStaleWorkouts");
const upload = require("../middlewares/uploadVideo");
const gymCheckinController = require("../controllers/gymCheckin.controller");
const router = express.Router();

router.use(authController.protect);

router
  .route("/challenge/:challengeId") // We asked for challengeId to know where to add the log
  .post(
    challengeController.getChallenge,
    requireActiveChallenge,
    autoFinishStaleWorkouts,
    gymCheckinController.autoCheckin, // ← runs first, records attendance
    workoutLogController.createMyChallengeWorkoutLog,
  ); // Create a challenge log (Start challenge)

router
  .route("/solo")
  .post(
    requireWorkoutPlan,
    autoFinishStaleWorkouts,
    gymCheckinController.autoCheckin, // ← runs first, records attendance
    workoutLogController.createMySoloWorkoutLog,
  )
  .get(workoutLogController.getMyWorkoutLogs);

router.get("/:id", requireWorkoutPlan, workoutLogController.getMyWorkoutLog);

// router
//     .route('/:workoutLogId/exercises/:exerciseIndex/sets/:setNumber')
//     .patch(workoutLogController.updateMyWorkoutSet);

router.post(
  "/:workoutLogId/exercises/:exerciseIndex/sets",
  workoutLogController.addSet,
);

router.delete(
  "/:workoutLogId/exercises/:exerciseIndex/sets/:setId",
  workoutLogController.removeSet,
);

router.patch(
  "/:workoutLogId/sets/bulk",
  workoutLogController.updateMyWorkoutSetsBulk,
);

router.patch(
  "/:workoutLogId/finish",
  upload.single("video"),
  workoutLogController.finishWorkoutLog,
);

router.use(authController.restrictTo("coach"));

router.get("/:challengeId/submissions", workoutLogController.getSubmissions);

router
  .route("/:workoutLogId/verify")
  .patch(workoutLogController.verifyChallengeWorkoutLog);

module.exports = router;
