"use strict";

var catchAsync = require("../utils/catchAsync");

exports.signUp = catchAsync(function _callee(req, res, next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          res.status(200).render("signup", {
            title: "Sign Up"
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
            title: "Login"
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
          res.status(200).render('dashboard', {
            title: 'Dashboard'
          });

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
});