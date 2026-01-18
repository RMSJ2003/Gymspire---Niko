const AppError = require("../utils/appError");

/* =======================
   DB ERROR HANDLERS
======================= */

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  const message = `${field} '${value}' is already in use. Please use another one.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join(" ")}`;
  return new AppError(message, 400);
};

/* =======================
   AUTH ERROR HANDLERS
======================= */

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again.", 401);

/* =======================
   RESPONSE SENDERS
======================= */

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or unknown error
  console.error("ERROR 💥", err);

  res.status(500).json({
    status: "error",
    message: "Something went very wrong!"
  });
};

/* =======================
   GLOBAL ERROR HANDLER
======================= */

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // DEVELOPMENT
  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  }

  // PRODUCTION
  if (process.env.NODE_ENV === "production") {
    let error = err;

    // Mongoose & MongoDB errors
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    // JWT errors
    if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    }

    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    return sendErrorProd(error, req, res);
  }
};
