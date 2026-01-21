"use strict";

var catchAsync = require("../utils/catchAsync");

exports.signUp = catchAsync(function _callee(req, res, next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          res.status(200).render("signup", {
            title: "Sign Up",
            hideNavbar: false
          });

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.login = catchAsync(function _callee2(req, res, next) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          res.status(200).render("login", {
            title: "Login",
            hideNavbar: false
          });

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.dashboard = catchAsync(function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          res.status(200).render("dashboard", {
            title: "Dashboard",
            hideNavbar: false
          });

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.adminDashboard = catchAsync(function _callee4(req, res, next) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          res.status(200).render("admin/dashboard", {
            title: "Admin Dashboard",
            hideNavbar: false
          });

        case 1:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.coachDashboard = catchAsync(function _callee5(req, res, next) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          res.status(200).render("coach/dashboard", {
            title: "Coach Dashboard",
            hideNavbar: false
          });

        case 1:
        case "end":
          return _context5.stop();
      }
    }
  });
});
exports.forgotPassword = catchAsync(function _callee6(req, res, next) {
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          res.status(200).render("auth/forgotPassword", {
            title: "Forgot Password",
            hideNavbar: false
          });

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.resetPassword = catchAsync(function _callee7(req, res, next) {
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          res.status(200).render("auth/resetPassword", {
            title: "Reset Password",
            hideNavbar: true,
            token: req.params.token
          });

        case 1:
        case "end":
          return _context7.stop();
      }
    }
  });
});