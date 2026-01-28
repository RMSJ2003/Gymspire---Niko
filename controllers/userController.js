const fs = require("fs");
const path = require("path");

const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

// Image (Multer) - START

// This phase:
// - File is in req.file.buffer
// - NOT saved yet
// - We control filename ourselves
const multerStorage = multer.memoryStorage();

// Allow only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload an image file", 400), false);
  }
};

// Final upload middleware
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 🔥 5 MB limit
  },
});

// This means: Input name must be pfp, File is available as req.file
exports.uploadUserPhoto = upload.single("pfp");

// Image - END

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  // Object.keys will be looping through an object in javascript and return an array of keys of the object.
  Object.keys(obj).forEach((fieldName) => {
    if (allowedFields.includes(fieldName)) newObj[fieldName] = obj[fieldName];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; // There is a authController.protect in the userRoutes so we still have access of ID in req.user
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Block password updates
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400,
      ),
    );

  const updates = {};

  // Username update
  if (req.body.username) {
    updates.username = req.body.username;
  }

  // Photo update
  if (req.file) {
    const ext = req.file.mimetype.split("/")[1];
    const filename = `user-${req.user._id}.${ext}`;

    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "img",
      "users",
      filename,
    );

    fs.writeFileSync(filePath, req.file.buffer);

    updates.pfpUrl = `/img/users/${filename}`;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { userType } = req.body;

  if (!["coach", "admin"].includes(userType))
    return next(new AppError("Invalid role", 400));

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { userType },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.updateProfilePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("Please upload a file", 400));

  const ext = req.file.mimetype.split("/")[1];
  const filename = `user-${req.user._id}.${ext}`;

  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "img",
    "users",
    filename,
  );

  fs.writeFileSync(filePath, req.file.buffer);

  const photoUrl = `/img/users/${filename}`;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { pfpUrl: photoUrl },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

// exports.deleteUser = factory.deleteOne(User);
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.userType === "admin") {
    return next(
      new AppError("Admin accounts cannot be deleted", 403)
    );
  }

  user.active = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "User deactivated successfully",
  });
});

// Without JSON
exports.acquireAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  req.users = users;

  next();
});