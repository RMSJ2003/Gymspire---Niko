"use strict";

var AppError = require("../utils/appError");
/* =======================
   DB ERROR HANDLERS
======================= */


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

var handleValidationErrorDB = function handleValidationErrorDB(err) {
  var errors = Object.values(err.errors).map(function (el) {
    return el.message;
  });
  var message = "Invalid input data. ".concat(errors.join(" "));
  return new AppError(message, 400);
};
/* =======================
   AUTH ERROR HANDLERS
======================= */


var handleJWTError = function handleJWTError() {
  return new AppError("Invalid token. Please log in again.", 401);
};

var handleJWTExpiredError = function handleJWTExpiredError() {
  return new AppError("Your token has expired. Please log in again.", 401);
};
/* =======================
   RESPONSE SENDERS
======================= */


var sendErrorDev = function sendErrorDev(err, req, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

var sendErrorProd = function sendErrorProd(err, req, res) {
  // Operational, trusted error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } // Programming or unknown error


  console.error("ERROR 💥", err);
  res.status(500).json({
    status: "error",
    message: "Something went very wrong!"
  });
};
/* =======================
   GLOBAL ERROR HANDLER
======================= */


module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error"; // DEVELOPMENT

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  } // PRODUCTION


  if (process.env.NODE_ENV === "production") {
    var error = err; // Mongoose & MongoDB errors

    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    } // JWT errors


    if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    }

    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    return sendErrorProd(error, req, res);
  }
};