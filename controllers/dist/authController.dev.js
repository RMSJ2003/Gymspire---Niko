"use strict";

var crypto = require("crypto");

var _require = require("util"),
    promisify = _require.promisify;

var jwt = require("jsonwebtoken");

var User = require("../models/userModel");

var sendEmail = require("./../utils/email");

var catchAsync = require("../utils/catchAsync");

var AppError = require("../utils/appError");

var isStrongPassword = function isStrongPassword(password) {
  // at least 8 chars, 1 letter, 1 number
  var strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return strongPasswordRegex.test(password);
};

var signToken = function signToken(id) {
  // .sign(<payload>, <secret>, <options>)
  return jwt.sign({
    id: id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

var createSendToken = function createSendToken(user, statusCode, res) {
  var token = signToken(user._id);
  var cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100),
    httpOnly: true // The cookie can't be access or modified in anyway by the browser (important for xss attacks)

  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  var redirectTo = '/dashboard';
  if (user.userType === 'admin') redirectTo = '/admin/dashboard';
  if (user.userType === 'coach') redirectTo = '/coach/dashboard';
  res.status(statusCode).json({
    status: "success",
    token: token,
    redirectTo: redirectTo,
    // The backend now tells frontend where to go
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(function _callee(req, res, next) {
  var _req$body, email, username, password, passwordConfirm, pfpUrl, newUser;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, username = _req$body.username, password = _req$body.password, passwordConfirm = _req$body.passwordConfirm, pfpUrl = _req$body.pfpUrl; // 🔐 Email rule 

          if (!(!email.endsWith("@iacademy.ph") && !email.endsWith("@iacademy.edu.ph"))) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", next(new AppError("Users and admins must use an iACADEMY email address.", 400)));

        case 3:
          if (isStrongPassword(password)) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", next(new AppError("Password must be at least 8 characters long and contain at least one letter and one number.", 400)));

        case 5:
          _context.next = 7;
          return regeneratorRuntime.awrap(User.create({
            email: email,
            username: username,
            password: password,
            passwordConfirm: passwordConfirm,
            pfpUrl: pfpUrl
          }));

        case 7:
          newUser = _context.sent;
          createSendToken(newUser, 201, res);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.createCoach = catchAsync(function _callee2(req, res, next) {
  var _req$body2, email, username, password, passwordConfirm, pfpUrl, newUser;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, username = _req$body2.username, password = _req$body2.password, passwordConfirm = _req$body2.passwordConfirm, pfpUrl = _req$body2.pfpUrl; // 1) Validate password strength (business logic)

          if (isStrongPassword(password)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new AppError("Password must be at least 8 characters long and contain at least one letter and one number.", 400)));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.create({
            email: email,
            username: username,
            password: password,
            passwordConfirm: passwordConfirm,
            pfpUrl: pfpUrl,
            userType: "coach"
          }));

        case 5:
          newUser = _context2.sent;
          createSendToken(newUser, 201, res);

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.login = catchAsync(function _callee3(req, res, next) {
  var _req$body3, email, password, user;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body3 = req.body, email = _req$body3.email, password = _req$body3.password; // 1) Checks if email and password exists

          if (!(!email || !password)) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", next(new AppError("Please provide email and password", 400)));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select("+password"));

        case 5:
          user = _context3.sent;
          _context3.t0 = !user;

          if (_context3.t0) {
            _context3.next = 11;
            break;
          }

          _context3.next = 10;
          return regeneratorRuntime.awrap(user.correctPassword(password, user.password));

        case 10:
          _context3.t0 = !_context3.sent;

        case 11:
          if (!_context3.t0) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", next(new AppError("Incorrect email or password", 401)));

        case 13:
          createSendToken(user, 200, res);

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.protect = catchAsync(function _callee4(req, res, next) {
  var token, decoded, currentUser;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // 1) Getting token and check if it exists
          if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]; // Getting the value of token cuz
            // the authorization looks like this:
            // Authorization: Bearer <token>
          }

          if (token) {
            _context4.next = 3;
            break;
          }

          return _context4.abrupt("return", next(new AppError("Your are not logged in! Please log in to get access", 401)));

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(token, process.env.JWT_SECRET));

        case 5:
          decoded = _context4.sent;
          _context4.next = 8;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 8:
          currentUser = _context4.sent;

          if (currentUser) {
            _context4.next = 11;
            break;
          }

          return _context4.abrupt("return", next(new AppError("The user belonging to this token does no longer exist.", 401)));

        case 11:
          if (!currentUser.changedPasswordAfter(decoded.iat)) {
            _context4.next = 13;
            break;
          }

          return _context4.abrupt("return", next(new AppError("User currently changed password! Please login again.", 401)));

        case 13:
          // Grant access to the protected route.
          req.user = currentUser;
          next();

        case 15:
        case "end":
          return _context4.stop();
      }
    }
  });
});

exports.restrictTo = function () {
  for (var _len = arguments.length, roles = new Array(_len), _key = 0; _key < _len; _key++) {
    roles[_key] = arguments[_key];
  }

  return function (req, res, next) {
    if (!roles.includes(req.user.userType)) return next(new AppError("You do not have permission to perform this action", 403));
    next();
  };
}; // CHANGING PASSWORD FUNCTIONALITIES - START


exports.forgotPassword = catchAsync(function _callee5(req, res, next) {
  var user, resetToken, resetURL, message;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context5.sent;

          if (user) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", next(new AppError("There is no user with that email address.", 404)));

        case 5:
          resetToken = user.createPasswordResetToken(); // We edited certain values from the user doc using the createPasswordResetToken function.

          _context5.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          // req.protocol is https/http
          // In here we will send the original reset token, not the encrypted one
          // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
          // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\n
          // If you didn't forget your password, please ignore this email!`;
          // // try {
          resetURL = "".concat(req.protocol, "://").concat(req.get("host"), "/api/v1/users/resetPassword/").concat(resetToken); // In here we will send the original reset token, not the encrypted one

          message = "Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ".concat(resetURL, ".\n    \nIf you didn't forget your password, please ignore this email!");
          _context5.prev = 10;
          _context5.next = 13;
          return regeneratorRuntime.awrap(sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message: message
          }));

        case 13:
          // We can't send the resetToken here it's dangerous - anyone can see it
          // We send it via email cuz email is safe
          res.status(200).json({
            status: "success",
            message: "Token sent to email!"
          });
          _context5.next = 23;
          break;

        case 16:
          _context5.prev = 16;
          _context5.t0 = _context5["catch"](10);
          user.createPasswordResetToken = undefined;
          user.passwordResetExpires = undefined;
          _context5.next = 22;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 22:
          return _context5.abrupt("return");

        case 23:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[10, 16]]);
});
exports.resetPassword = catchAsync(function _callee6(req, res, next) {
  var hashedToken, user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          // 1) Get user based on the given token
          // req.params come from the URL
          hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context6.sent;
          // 2} If token has not expired, and there is a user, set the new password.
          if (!user) next(new AppError("Token is invalid or has expired", 400));
          user.password = req.body.password;
          user.passwordConfirm = req.body.passwordConfirm; // Since we already updated the password, we can now remove the rest token fields

          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          _context6.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          createSendToken(user, 200, res);

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  });
}); // CHANGING PASSWORD FUNCTIONALITIES - END
// With this, pug files can now do something like this:
// if user
//   p Welcome #{user.username}

exports.isLoggedIn = catchAsync(function _callee7(req, res, next) {
  var decoded, user;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          if (!req.cookies.jwt) {
            _context7.next = 11;
            break;
          }

          _context7.prev = 1;
          decoded = jwt.verify(req.cookies.process.env.JWT_SECRET);
          _context7.next = 5;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 5:
          user = _context7.sent;
          if (user) res.locals.user = user;
          _context7.next = 11;
          break;

        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](1);

        case 11:
          next();

        case 12:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[1, 9]]);
});