const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const User = require("../models/userModel");
const WorkoutLog = require("../models/workoutLogModel");
const WorkoutPlan = require("../models/workoutPlanModel");
const GymAttendance = require("../models/gymAttendanceModel");
const Challenge = require("../models/challengeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

// ============================================================
// CLOUDINARY CONFIG (once, at the top)
// ============================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ============================================================
// MULTER — memory storage, images only, 5 MB cap
// ============================================================
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("Please upload an image file", 400), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadUserPhoto = upload.single("pfp");

// ============================================================
// HELPER — upload buffer to Cloudinary, return secure_url
// ============================================================
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "gymspire/users" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });
// ============================================================
// AUTO CHECKOUT HELPER
// Call this whenever a workout ends OR user logs out.
// Closes the open GymAttendance record and clears User status.
// ============================================================

// Add to top of userController.js:
// const GymAttendance = require("../models/gymAttendanceModel");

// ── REUSABLE HELPER (not a route handler) ───────────────────
// Use this inside other controllers too (e.g. workoutLogController)
const closeAttendance = async (userId) => {
  const now = new Date();

  // Close open attendance record
  const openRecord = await GymAttendance.findOne({
    user: userId,
    checkoutTime: null,
  }).sort({ checkinTime: -1 });

  if (openRecord) {
    const durationMs = now - openRecord.checkinTime;
    openRecord.checkoutTime = now;
    openRecord.durationMinutes = Math.round(durationMs / 60000);
    await openRecord.save();
  }

  // Clear live status on User
  await User.findByIdAndUpdate(userId, {
    isAtGym: false,
    gymStatus: "offline",
    gymCheckinTime: null,
  });
};

// Export so other controllers can use it
exports.closeAttendance = closeAttendance;

// Add this helper function near the top of userController.js
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.getUserAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const records = await GymAttendance.find({ user: id })
    .sort({ checkinTime: -1 }) // newest first
    .limit(100); // cap at 100 records

  res.status(200).json({
    status: "success",
    results: records.length,
    data: records,
  });
});

// ── ROUTE HANDLER: manual "Leave gym" button ─────────────────
// PATCH /api/v1/users/gymCheckin  body: { status: "offline" }
exports.gymCheckin = catchAsync(async (req, res, next) => {
  const { status, latitude, longitude } = req.body;
  console.log("gym checkin start");

  if (!["atGym", "offline"].includes(status)) {
    console.log("first if");

    return next(new AppError('Status must be "atGym" or "offline"', 400));
  }

  if (status === "atGym") {
    console.log("2nd if");

    // ── GPS VERIFICATION ──
    if (!latitude || !longitude) {
      console.log("2nd.1st if");
      return res.status(400).json({
        status: "fail",
        message: "Location is required to check in at the gym.",
      });
    }

    const gymLat = parseFloat(process.env.GYM_LAT);
    const gymLng = parseFloat(process.env.GYM_LNG);
    const radius = parseFloat(process.env.GYM_RADIUS_METERS) || 150;

    const distance = getDistanceMeters(latitude, longitude, gymLat, gymLng);

    if (distance > radius) {
      console.log("3rd if");
      return res.status(400).json({
        status: "fail",
        message: `You must be at the gym to check in. You are ${Math.round(distance)}m away.`,
      });
    }

    const now = new Date();

    await User.findByIdAndUpdate(req.user.id, {
      isAtGym: true,
      gymStatus: "atGym",
      gymCheckinTime: now,
    });

    await GymAttendance.create({
      user: req.user.id,
      checkinTime: now,
      source: "manual",
    });
  } else {
    // CHECKOUT — no location needed
    const now = new Date();

    // Guard: if already offline, do nothing (prevents double-close)
    const currentUser = await User.findById(req.user.id).select("gymStatus");
    if (currentUser.gymStatus === "offline") {
      return res
        .status(200)
        .json({ status: "success", message: "Already checked out." });
    }

    await User.findByIdAndUpdate(req.user.id, {
      isAtGym: false,
      gymStatus: "offline",
      gymCheckinTime: null,
    });

    const openRecord = await GymAttendance.findOne({
      user: req.user.id,
      checkoutTime: null,
    }).sort({ checkinTime: -1 });

    if (openRecord) {
      openRecord.checkoutTime = now;
      openRecord.durationMinutes = Math.round(
        (now - openRecord.checkinTime) / 60000,
      );
      await openRecord.save();
    }
  }

  res.status(200).json({ status: "success" });
});
// ============================================================
// GET ME
// ============================================================
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// ============================================================
// UPDATE ME (username + optional photo)
// ============================================================
exports.updateMe = catchAsync(async (req, res, next) => {
  // Block password changes through this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400,
      ),
    );
  }

  const updates = {};

  if (req.body.username) updates.username = req.body.username;

  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      updates.pfpUrl = result.secure_url;
    } catch (err) {
      return next(new AppError("Image upload failed", 500));
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

// ============================================================
// DELETE ME (soft delete)
// ============================================================
exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
    emailVerified: false,
  });

  res.status(204).json({ status: "success", data: null });
});

// ============================================================
// PERMANENT DELETE ME
// ============================================================
exports.permanentDeleteMe = catchAsync(async (req, res) => {
  const userId = req.user.id;

  await Challenge.updateMany(
    { participants: userId },
    { $pull: { participants: userId } },
  );
  await WorkoutLog.deleteMany({ userId });
  await WorkoutPlan.deleteMany({ userId });
  await User.findByIdAndDelete(userId);

  res.status(204).json({ status: "success", data: null });
});

// ============================================================
// GYM CHECK-IN
// PATCH /api/v1/users/gymCheckin
// Body: { status: "atGym" | "offline" }
//
// Uses fields on the User model — no separate collection needed:
//   isAtGym:        Boolean  (default: false)
//   gymStatus:      String   enum ["atGym", "logging", "offline"]
//   gymCheckinTime: Date
// ============================================================

// ============================================================
// UPDATE USER ROLE (admin only)
// ============================================================
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { userType } = req.body;

  if (!["coach", "admin"].includes(userType)) {
    return next(new AppError("Invalid role", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { userType },
    { new: true, runValidators: true },
  );

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ status: "success", data: user });
});

// ============================================================
// ADMIN — deactivate user
// ============================================================
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError("User not found", 404));

  user.emailVerified = false;
  user.active = false;
  user.approvedByClinic = "pending";
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "User deactivated successfully",
  });
});

// ============================================================
// FACTORY ROUTES
// ============================================================
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);

// ============================================================
// MIDDLEWARE — attach all users to req (no JSON response)
// ============================================================
exports.acquireAllUsers = catchAsync(async (req, res, next) => {
  req.users = await User.find();
  next();
});
