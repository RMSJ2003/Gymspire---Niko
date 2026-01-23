"use strict";

var fs = require("fs");

var path = require("path");

var multer = require("multer");

var User = require("../models/userModel");

var AppError = require("../utils/appError");

var catchAsync = require("../utils/catchAsync");

var factory = require("./handlerFactory"); // Image (Multer) - START
// This phase:
// - File is in req.file.buffer
// - NOT saved yet
// - We control filename ourselves


var multerStorage = multer.memoryStorage(); // Allow only images

var multerFilter = function multerFilter(req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload an image file", 400), false);
  }
}; // Final upload middleware


var upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 🔥 5 MB limit

  }
}); // This means: Input name must be pfp, File is available as req.file

exports.uploadUserPhoto = upload.single("pfp"); // Image - END

var filterObj = function filterObj(obj) {
  for (var _len = arguments.length, allowedFields = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    allowedFields[_key - 1] = arguments[_key];
  }

  var newObj = {}; // Object.keys will be looping through an object in javascript and return an array of keys of the object.

  Object.keys(obj).forEach(function (fieldName) {
    if (allowedFields.includes(fieldName)) newObj[fieldName] = obj[fieldName];
  });
  return newObj;
};

exports.getMe = function (req, res, next) {
  req.params.id = req.user.id; // There is a authController.protect in the userRoutes so we still have access of ID in req.user

  next();
};

exports.updateMe = catchAsync(function _callee(req, res, next) {
  var updates, ext, filename, filePath, updatedUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.body.password || req.body.passwordConfirm)) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next(new AppError("This route is not for password updates. Please use /updateMyPassword", 400)));

        case 2:
          updates = {}; // Username update

          if (req.body.username) {
            updates.username = req.body.username;
          } // Photo update


          if (req.file) {
            ext = req.file.mimetype.split("/")[1];
            filename = "user-".concat(req.user._id, ".").concat(ext);
            filePath = path.join(__dirname, "..", "public", "img", "users", filename);
            fs.writeFileSync(filePath, req.file.buffer);
            updates.pfpUrl = "/img/users/".concat(filename);
          }

          _context.next = 7;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, updates, {
            "new": true,
            runValidators: true
          }));

        case 7:
          updatedUser = _context.sent;
          res.status(200).json({
            status: "success",
            data: {
              user: updatedUser
            }
          });

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.deleteMe = catchAsync(function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, {
            active: false
          }));

        case 2:
          res.status(204).json({
            status: "success",
            data: null
          });

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.updateUserRole = catchAsync(function _callee3(req, res, next) {
  var userType, user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          userType = req.body.userType;

          if (["coach", "admin"].includes(userType)) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", next(new AppError("Invalid role", 400)));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, {
            userType: userType
          }, {
            "new": true,
            runValidators: true
          }));

        case 5:
          user = _context3.sent;
          res.status(200).json({
            status: "success",
            data: user
          });

        case 7:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.updateProfilePhoto = catchAsync(function _callee4(req, res, next) {
  var ext, filename, filePath, photoUrl, updatedUser;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (req.file) {
            _context4.next = 2;
            break;
          }

          return _context4.abrupt("return", next(new AppError("Please upload a file", 400)));

        case 2:
          ext = req.file.mimetype.split("/")[1];
          filename = "user-".concat(req.user._id, ".").concat(ext);
          filePath = path.join(__dirname, "..", "public", "img", "users", filename);
          fs.writeFileSync(filePath, req.file.buffer);
          photoUrl = "/img/users/".concat(filename);
          _context4.next = 9;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user._id, {
            pfpUrl: photoUrl
          }, {
            "new": true,
            runValidators: true
          }));

        case 9:
          updatedUser = _context4.sent;
          res.status(200).json({
            status: "success",
            data: {
              user: updatedUser
            }
          });

        case 11:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);