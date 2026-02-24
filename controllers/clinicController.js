const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.approveUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  user.approvedByClinic = "approved";
  //   user.active = true; // 🔥 re-enable if previously declined
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ status: "success" });
});

exports.declineUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError("User not found", 404));

  user.approvedByClinic = "declined";
  //   user.active = false; // 🔥 optional: deactivate user

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "User declined",
  });
});
