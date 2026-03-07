// Add this require at the top of userController.js:
// const GymAttendance = require("../models/gymAttendanceModel");

// ============================================================
// GYM CHECK-IN
// PATCH /api/v1/users/gymCheckin
// Body: { status: "atGym" | "offline" }
//
// On "atGym":
//   - Sets gymStatus on User (live status for the dashboard card)
//   - Creates a GymAttendance record (permanent history)
//
// On "offline" (checkout):
//   - Clears gymStatus on User
//   - Closes the open GymAttendance record + computes duration

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const GymAttendance = require("../models/gymAttendanceModel");
const User = require("../models/userModel");

// ============================================================
exports.gymCheckin = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!["atGym", "offline"].includes(status)) {
    return next(new AppError('Status must be "atGym" or "offline"', 400));
  }

  if (status === "atGym") {
    const now = new Date();

    // 1) Update live status on User
    await User.findByIdAndUpdate(req.user.id, {
      isAtGym: true,
      gymStatus: "atGym",
      gymCheckinTime: now,
    });

    // 2) Create attendance record (history)
    await GymAttendance.create({
      user: req.user.id,
      checkinTime: now,
      source: "manual",
    });
  } else {
    // CHECKOUT
    const now = new Date();

    // 1) Clear live status on User
    await User.findByIdAndUpdate(req.user.id, {
      isAtGym: false,
      gymStatus: "offline",
      gymCheckinTime: null,
    });

    // 2) Close the most recent open attendance record
    const openRecord = await GymAttendance.findOne({
      user: req.user.id,
      checkoutTime: null,
    }).sort({ checkinTime: -1 }); // get the most recent one

    if (openRecord) {
      const durationMs = now - openRecord.checkinTime;
      const durationMinutes = Math.round(durationMs / 60000);

      openRecord.checkoutTime = now;
      openRecord.durationMinutes = durationMinutes;
      await openRecord.save();
    }
  }

  res.status(200).json({ status: "success" });
});

// ============================================================
// Also call this when a user STARTS a workout (solo or challenge)
// so attendance is recorded even if they never tapped check-in.
//
// Add this to your startWorkout / createWorkoutLog controller:
// ============================================================
exports.autoCheckin = catchAsync(async (req, res, next) => {
  const now = new Date();

  // Only create a new attendance record if not already checked in
  const alreadyCheckedIn = await GymAttendance.findOne({
    user: req.user.id,
    checkoutTime: null,
  });

  if (!alreadyCheckedIn) {
    await GymAttendance.create({
      user: req.user.id,
      checkinTime: now,
      source: "workout", // came from starting a workout, not manual tap
    });

    await User.findByIdAndUpdate(req.user.id, {
      isAtGym: true,
      gymStatus: "logging",
      gymCheckinTime: now,
    });
  } else {
    // Already checked in manually — just upgrade their status to "logging"
    await User.findByIdAndUpdate(req.user.id, {
      gymStatus: "logging",
    });
  }

  next(); // continue to the actual workout creation
});
