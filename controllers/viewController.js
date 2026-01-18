const catchAsync = require("../utils/catchAsync");

exports.signUp = catchAsync(async (req, res, next) => {
  res.status(200).render("signup", {
    title: "Sign Up",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Login",
  });
});

exports.dashboard = catchAsync(async (req, res, next) => {
  res.status(200).render('dashboard', {
    title: 'Dashboard'
  });
});