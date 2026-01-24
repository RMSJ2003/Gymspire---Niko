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
exports.profile = catchAsync(function _callee8(req, res, next) {
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          res.status(200).render("profile", {
            title: "Profile"
          });

        case 1:
        case "end":
          return _context8.stop();
      }
    }
  });
});
exports.workoutPlan = catchAsync(function _callee9(req, res, next) {
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          res.status(200).render("workoutPlan", {
            title: "Workout Plan"
          });

        case 1:
        case "end":
          return _context9.stop();
      }
    }
  });
});
exports.challenges = catchAsync(function _callee10(req, res, next) {
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          res.status(200).render("challenges", {
            title: "Challenges"
          });

        case 1:
        case "end":
          return _context10.stop();
      }
    }
  });
});
exports.workoutLogs = catchAsync(function _callee11(req, res, next) {
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          res.status(200).render("workoutLogs", {
            title: "Workout Logs"
          });

        case 1:
        case "end":
          return _context11.stop();
      }
    }
  });
});
exports.startSoloWorkout = catchAsync(function _callee12(req, res, next) {
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          res.status(200).render("startSoloWorkout", {
            title: "Start Solo Workout"
          });

        case 1:
        case "end":
          return _context12.stop();
      }
    }
  });
});
exports.editProfile = catchAsync(function _callee13(req, res, next) {
  return regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          res.status(200).render("editProfile", {
            title: "Edit Profile",
            currentUser: req.user
          });

        case 1:
        case "end":
          return _context13.stop();
      }
    }
  });
});