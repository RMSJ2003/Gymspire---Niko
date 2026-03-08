const dayjs = require("dayjs");
const isoWeek = require("dayjs/plugin/isoWeek");

dayjs.extend(isoWeek);

const WorkoutLog = require("../models/workoutLogModel");
const WorkoutPlan = require("../models/workoutPlanModel");
const Challenge = require("../models/challengeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const ensureNoOngoingWorkoutLog = require("../utils/ensureNoOngoingWorkoutLogs");
const createDefaultSets = require("../utils/defaultWorkoutSets");
const { enforceMuscleRest } = require("../services/restRule.service");
const { closeAttendance } = require("./userController");

function computeStrengthScore(workoutLog) {
  let score = 0;

  workoutLog.exercises.forEach((ex) => {
    ex.set.forEach((s) => {
      if (s.type === "working") {
        const estimated1RM = s.weight * (1 + s.reps / 30);
        score += estimated1RM;
      }
    });
  });

  return score;
}

exports.createMySoloWorkoutLog = catchAsync(async (req, res, next) => {
  const { targets } = req.body;

  await ensureNoOngoingWorkoutLog(req.user._id);

  if (!Array.isArray(targets) || targets.length === 0) {
    return next(new AppError("Please select at least one muscle group", 400));
  }

  const lastWorkoutLog = await WorkoutLog.findOne({
    userId: req.user._id,
  }).sort({ date: -1 });

  try {
    enforceMuscleRest({ lastWorkoutLog, targets });
  } catch (err) {
    return next(new AppError(err.message, 409));
  }

  const planExercises = req.workoutPlan.exerciseDetails;
  const validTargets = planExercises.map((ex) => ex.target);

  const invalidTargets = targets.filter((t) => !validTargets.includes(t));
  if (invalidTargets.length) {
    return next(
      new AppError(`Invalid muscle targets: ${invalidTargets.join(", ")}`, 400),
    );
  }

  const selectedExercises = planExercises
    .filter((ex) => targets.includes(ex.target))
    .map((ex) => ({
      name: ex.name,
      target: ex.target,
      gifURL: ex.gifURL,
      set: createDefaultSets(),
    }));

  if (!selectedExercises.length) {
    return next(new AppError("No matching exercises found", 400));
  }

  const newWorkoutLog = await WorkoutLog.create({
    userId: req.user._id,
    workoutPlanId: req.workoutPlan._id,
    status: "ongoing",
    exercises: selectedExercises,
  });

  res.status(201).json({ status: "success", data: newWorkoutLog });
});

exports.createMyChallengeWorkoutLog = catchAsync(async (req, res, next) => {
  const challenge = req.challenge;

  await ensureNoOngoingWorkoutLog(req.user._id);

  const joined = challenge.participants.some(
    (id) => id.toString() === req.user._id.toString(),
  );

  if (!joined) {
    return next(
      new AppError("You are not a participant of this challenge", 409),
    );
  }

  const alreadyLogged = await WorkoutLog.findOne({
    userId: req.user._id,
    challengeId: challenge._id,
  });

  if (alreadyLogged) {
    return next(
      new AppError("You already have a workout log for this challenge", 409),
    );
  }

  const challengeExercises = challenge.exerciseDetails.map((ex) => ({
    name: ex.name,
    target: ex.target,
    gifURL: ex.gifURL,
    set: createDefaultSets(),
  }));

  const lastWorkoutLog = await WorkoutLog.findOne({
    userId: req.user._id,
  }).sort({ date: -1 });

  const challengeTargets = challengeExercises.map((ex) => ex.target);

  try {
    enforceMuscleRest({ lastWorkoutLog, targets: challengeTargets });
  } catch (err) {
    return next(new AppError(err.message, 409));
  }

  const newChallengeWorkoutLog = await WorkoutLog.create({
    userId: req.user._id,
    challengeId: challenge._id,
    status: "ongoing",
    exercises: challengeExercises,
  });

  res.status(201).json({ status: "success", data: newChallengeWorkoutLog });
});

exports.getMyWorkoutLogs = catchAsync(async (req, res, next) => {
  const workoutLogs = await WorkoutLog.find({ userId: req.user._id });

  res.status(200).json({ status: "success", data: workoutLogs });
});

exports.updateMyWorkoutSetsBulk = catchAsync(async (req, res, next) => {
  const { workoutLogId } = req.params;
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return next(new AppError("No set updates provided", 400));
  }

  const workoutLog = await WorkoutLog.findById(workoutLogId);
  if (!workoutLog) return next(new AppError("Workout log not found", 404));

  if (workoutLog.userId.toString() !== req.user._id.toString())
    return next(new AppError("Not authorized", 403));

  if (workoutLog.status === "done")
    return next(new AppError("Workout already finished", 400));

  let updatedCount = 0;

  workoutLog.exercises.forEach((exercise) => {
    exercise.set.forEach((set) => {
      const match = updates.find(
        (u) => u.setId.toString() === set._id.toString(),
      );
      if (match) {
        set.weight = Number(match.weight);
        set.reps = Number(match.reps);
        updatedCount++;
      }
    });
  });

  if (updatedCount === 0)
    return next(new AppError("No matching sets found to update", 400));

  await workoutLog.save();

  res.status(200).json({
    status: "success",
    updatedSets: updatedCount,
    data: workoutLog,
  });
});

exports.getMyWorkoutLog = catchAsync(async (req, res, next) => {
  const workoutLog = await WorkoutLog.findById(req.params.id);

  if (!workoutLog) return next(new AppError("Workout log not found", 404));

  if (workoutLog.workoutPlanId) {
    const workoutPlan = await WorkoutPlan.findById(workoutLog.workoutPlanId);
    if (
      !workoutPlan ||
      workoutPlan.userId.toString() !== req.user._id.toString()
    )
      return next(new AppError("Not authorized", 403));
  }

  if (workoutLog.challengeId) {
    const challenge = await Challenge.findById(workoutLog.challengeId);
    if (
      !challenge ||
      !challenge.participants.some(
        (p) => p.toString() === req.user._id.toString(),
      )
    )
      return next(new AppError("Not authorized", 403));
  }

  if (workoutLog.status === "done")
    return next(new AppError("Workout already finished", 400));

  res.status(200).json({ status: "success", data: workoutLog });
});

exports.finishWorkoutLog = catchAsync(async (req, res, next) => {
  const workoutLog = await WorkoutLog.findById(req.params.workoutLogId);

  if (!workoutLog) return next(new AppError("Workout log not found", 404));

  if (workoutLog.userId.toString() !== req.user._id.toString())
    return next(
      new AppError("You are not allowed to finish this workout", 403),
    );

  if (workoutLog.status === "done")
    return next(new AppError("Workout is already finished", 409));

  if (req.file) {
    workoutLog.videoUrl = req.file.path;
  }

  await closeAttendance(req.user.id);

  workoutLog.status = "done";
  await workoutLog.save();

  res.status(200).json({ status: "success", data: workoutLog });
});

exports.getSubmissions = catchAsync(async (req, res, next) => {
  const { challengeId } = req.params;

  const workoutLogs = await WorkoutLog.find({ status: "done", challengeId });

  res.status(200).json({
    message: "success",
    results: workoutLogs.length,
    data: workoutLogs,
  });
});

exports.verifyChallengeWorkoutLog = catchAsync(async (req, res, next) => {
  const { workoutLogId } = req.params;
  const { decision, judgeNotes } = req.body;

  if (!["approved", "rejected"].includes(decision))
    return next(new AppError("Decision must be approved or rejected"));

  const workoutLog = await WorkoutLog.findById(workoutLogId);
  if (!workoutLog) return next(new AppError("Workout log not found"));

  if (!workoutLog.challengeId)
    return next(new AppError("Solo workouts cannot be verified", 400));

  const challenge = await Challenge.findById(workoutLog.challengeId);
  if (!challenge) return next(new AppError("Challenge not found", 404));

  const isParticipant = challenge.participants.some(
    (p) => p.toString() === req.user._id.toString(),
  );

  if (isParticipant)
    return next(
      new AppError(
        "Coaches who are participants cannot verify workouts in this challenge.",
        403,
      ),
    );

  if (workoutLog.userId.toString() === req.user._id.toString())
    return next(
      new AppError(
        "Coaches are not allowed to verify their own workout log.",
        403,
      ),
    );

  if (workoutLog.status !== "done")
    return next(
      new AppError("Workout must be finished before verification", 401),
    );

  if (workoutLog.judgeStatus !== "pending")
    return next(new AppError("Workout already verified", 409));

  workoutLog.judgeStatus = decision;
  workoutLog.judgeNotes = judgeNotes || "";
  workoutLog.verifiedBy = req.user._id;

  if (decision === "approved")
    workoutLog.strengthScore = computeStrengthScore(workoutLog);

  await workoutLog.save();

  res.status(200).json({ status: "success", data: workoutLog });
});

// ================================================================
// ADD SET
// POST /api/v1/workout-logs/:workoutLogId/exercises/:exerciseIndex/sets
// ================================================================
exports.addSet = catchAsync(async (req, res, next) => {
  const { workoutLogId, exerciseIndex } = req.params;

  const workoutLog = await WorkoutLog.findById(workoutLogId);
  if (!workoutLog) return next(new AppError("Workout log not found", 404));
  if (workoutLog.userId.toString() !== req.user._id.toString())
    return next(new AppError("Not authorized", 403));
  if (workoutLog.status === "done")
    return next(new AppError("Workout already finished", 400));

  const exercise = workoutLog.exercises[exerciseIndex];
  if (!exercise) return next(new AppError("Exercise not found", 404));

  const workingSets = exercise.set.filter((s) => s.type === "working");
  const nextSetNumber =
    workingSets.length > 0
      ? Math.max(...workingSets.map((s) => s.setNumber)) + 1
      : 1;

  exercise.set.push({
    setNumber: nextSetNumber,
    type: "working",
    weight: 0,
    unit: "LB",
    reps: 8,
    restSeconds: 180,
  });

  workoutLog.markModified("exercises");

  // ✅ validateBeforeSave: false — the duplicate setNumber validator fires
  // before the new set is fully committed, causing a false positive
  await workoutLog.save({ validateBeforeSave: false });

  const newSet = exercise.set[exercise.set.length - 1];

  res.status(200).json({
    status: "success",
    data: {
      setId: newSet._id,
      setNumber: nextSetNumber,
      weight: 0,
      reps: 8,
      unit: "LB",
    },
  });
});

// ================================================================
// REMOVE SET
// DELETE /api/v1/workout-logs/:workoutLogId/exercises/:exerciseIndex/sets/:setId
// ================================================================
exports.removeSet = catchAsync(async (req, res, next) => {
  const { workoutLogId, exerciseIndex, setId } = req.params;

  const workoutLog = await WorkoutLog.findById(workoutLogId);
  if (!workoutLog) return next(new AppError("Workout log not found", 404));
  if (workoutLog.userId.toString() !== req.user._id.toString())
    return next(new AppError("Not authorized", 403));
  if (workoutLog.status === "done")
    return next(new AppError("Workout already finished", 400));

  const exercise = workoutLog.exercises[exerciseIndex];
  if (!exercise) return next(new AppError("Exercise not found", 404));

  const workingSets = exercise.set.filter((s) => s.type === "working");
  if (workingSets.length <= 1)
    return next(new AppError("Cannot remove the last set", 400));

  const setToRemove = exercise.set.id(setId);
  if (!setToRemove) return next(new AppError("Set not found", 404));
  if (setToRemove.weight > 0)
    return next(new AppError("Cannot remove a completed set", 400));

  setToRemove.deleteOne();

  // Renumber all working sets cleanly
  let count = 0;
  exercise.set.forEach((s) => {
    if (s.type === "working") s.setNumber = ++count;
  });

  workoutLog.markModified("exercises");

  // ✅ validateBeforeSave: false — same reason as addSet
  await workoutLog.save({ validateBeforeSave: false });

  res.status(200).json({ status: "success" });
});

// ================================================================
// ACQUIRE (for views — attaches to req, no JSON response)
// ================================================================
exports.acquireMyWorkoutLogs = catchAsync(async (req, res, next) => {
  const workoutLogs = await WorkoutLog.find({ userId: req.user._id })
    .sort({ date: -1 })
    .populate("verifiedBy", "username email")
    .populate("challengeId", "name");

  req.myWorkoutLogs = workoutLogs;
  next();
});

exports.acquireMyWorkoutLog = catchAsync(async (req, res, next) => {
  const workoutLog = await WorkoutLog.findById(req.params.id)
    .populate("challengeId", "name startTime endTime")
    .populate("workoutPlanId", "name")
    .populate("verifiedBy", "username");

  if (!workoutLog) return next(new AppError("Workout log not found", 404));

  req.myWorkoutLog = workoutLog;
  next();
});

exports.acquireSubmissions = catchAsync(async (req, res, next) => {
  const { challengeId } = req.params;

  const workoutLogs = await WorkoutLog.find({
    status: "done",
    challengeId,
  }).populate("userId", "username email pfpUrl");

  const formattedLogs = workoutLogs.map((log) => ({
    ...log.toObject(),
    formattedDate: new Date(log.date).toDateString(),
  }));

  req.submissionLogs = formattedLogs;
  next();
});

exports.acquireMyTargetWeeklyFrequency = catchAsync(async (req, res, next) => {
  const startOfWeek = dayjs().startOf("week").toDate();
  const endOfWeek = dayjs().endOf("week").toDate();

  const targets = [
    ...new Set(req.workoutPlan.exerciseDetails.map((ex) => ex.target)),
  ];
  const frequency = await WorkoutLog.aggregate([
    {
      $match: {
        userId: req.user._id,
        status: "done",
        date: { $gte: startOfWeek, $lte: endOfWeek },
      },
    },
    {
      $project: {
        uniqueTargets: { $setUnion: ["$exercises.target", []] },
      },
    },
    { $unwind: "$uniqueTargets" },
    { $match: { uniqueTargets: { $in: targets } } },
    { $group: { _id: "$uniqueTargets", trained: { $sum: 1 } } },
  ]);

  const TARGET_PER_WEEK = 2;

  const result = targets.map((muscle) => {
    const found = frequency.find((f) => f._id === muscle);
    return {
      muscle,
      trained: found ? found.trained : 0,
      target: TARGET_PER_WEEK,
    };
  });

  req.myTargetWeeklyFrequency = result;
  next();
});

exports.acquireMyWeeklyWorkoutCount = async (req, res, next) => {
  const startOfWeek = dayjs().startOf("isoWeek").toDate();
  const endOfWeek = dayjs().endOf("isoWeek").toDate();

  const workoutCount = await WorkoutLog.countDocuments({
    userId: req.user._id,
    date: { $gte: startOfWeek, $lte: endOfWeek },
    status: "done",
  });

  req.weeklyWorkoutCount = workoutCount;
  next();
};
