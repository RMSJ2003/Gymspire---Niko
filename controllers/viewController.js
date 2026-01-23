const catchAsync = require("../utils/catchAsync");

exports.signUp = catchAsync(async (req, res, next) => {
  res.status(200).render("signup", {
    title: "Sign Up",
    hideNavbar: false,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Login",
    hideNavbar: false,
  });
});

exports.dashboard = catchAsync(async (req, res, next) => {
  res.status(200).render("dashboard", {
    title: "Dashboard",
    hideNavbar: false,
  });
});

exports.adminDashboard = catchAsync(async (req, res, next) => {
  res.status(200).render("admin/dashboard", {
    title: "Admin Dashboard",
    hideNavbar: false,
  });
});

exports.coachDashboard = catchAsync(async (req, res, next) => {
  res.status(200).render("coach/dashboard", {
    title: "Coach Dashboard",
    hideNavbar: false,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  res.status(200).render("auth/forgotPassword", {
    title: "Forgot Password",
    hideNavbar: false,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  res.status(200).render("auth/resetPassword", {
    title: "Reset Password",
    hideNavbar: true,
    token: req.params.token,
  });
});

exports.profile = catchAsync(async (req, res, next) => {
  res.status(200).render("profile", {
    title: "Profile",
  });
});

exports.workoutPlan = catchAsync(async (req, res, next) => {
  let exercises = [];

  if (req.workoutPlan && req.workoutPlan.exerciseDetails) {
    exercises = req.workoutPlan.exerciseDetails;
  }

  res.status(200).render("workoutPlan", {
    title: "Workout Plan",
    exercises,
    hasPlan: !!req.workoutPlan,
  });
});

exports.challenges = catchAsync(async (req, res, next) => {
  res.status(200).render("challenges", {
    title: "Challenges",
  });
});

exports.workoutLogs = catchAsync(async (req, res, next) => {
  res.status(200).render("workoutLogs", {
    title: "Workout Logs",
  });
});

exports.startSoloWorkout = catchAsync(async (req, res, next) => {
  res.status(200).render("startSoloWorkout", {
    title: "Start Solo Workout",
  });
});

exports.editProfile = catchAsync(async (req, res, next) => {
  res.status(200).render("editProfile", {
    title: "Edit Profile",
    currentUser: req.user,
  });
});

exports.createWorkoutPlan = catchAsync(async (req, res, next) => {
    res.status(200).render("createWorkoutPlan", {
    title: "Create Workout Plan",
    currentUser: req.user,
    exercises: req.exercises
  });
});

exports.editWorkoutPlan = catchAsync(async (req, res, next) => {
    res.status(200).render("editWorkoutPlan", {
    title: "Edit Workout Plan",
    currentUser: req.user,
  });
});

