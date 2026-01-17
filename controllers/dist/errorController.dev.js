"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AppError = require("../utils/appError");

var handleCastErrorDB = function handleCastErrorDB(err) {
  var message = "Invalid ".concat(err.path, ": ").concat(err.value, ".");
  return new AppError(message, 400);
};

var handleDuplicateFieldsDB = function handleDuplicateFieldsDB(err) {
  var field = Object.keys(err.keyValue)[0];
  var value = err.keyValue[field];
  var message = "".concat(field, " '").concat(value, "' is already in use. Please use another one.");
  return new AppError(message, 400);
};

var handleJWTError = function handleJWTError() {
  return new AppError("Invalid token. Please log in again!", 401);
};

var handleJWTExpiredError = function handleJWTExpiredError() {
  return new AppError("Your token has expired! Please log in again!");
};

var sendErrorDev = function sendErrorDev(err, req, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

var handleValidationErrorDB = function handleValidationErrorDB(err) {
  // To create one big string from all the errors, we have to loop
  // over all fo these objects and then extract all the error messages
  // into a new array.
  var errors = Object.values(err.errors).map(function (el) {
    return el.message;
  }); // This returns a new array

  var message = "Invalid input data. ".concat(errors.join(". "));
  return new AppError(message, 400);
};

var sendErrorProd = function sendErrorProd(err, req, res) {
  // Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other uknown error: don't want to leak the details to the client.
    // Only send details to the developers.
    // 1) Log the error
    console.error("ERROR 💥", err); // 2) Send generic message: Sending NON-OPERATIONAL ERROR

    res.status(500).json({
      status: "error",
      message: "Something went very wrong!"
    });
  }
};

module.exports = function (err, req, res, next) {
  // err.stack will show us where the error has happened.
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500; // 500 means internal server error

  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res);

  if (process.env.NODE_ENV === "production") {
    // We separately include err.name cuz it is the constructor of CastError that
    // creates the name property
    var error = _objectSpread({}, err);

    error.message = err.message; // CastError and ValidationError is created by Mongoose.
    // CastError will come from example: we update a tour with invalid ratingsAverage
    // or difficulty, etc.

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError(error);
    sendErrorProd(error, res);
  }
};