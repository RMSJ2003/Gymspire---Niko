const AppError = require("../utils/appError");

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

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again!");

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleValidationErrorDB = (err) => {
  // To create one big string from all the errors, we have to loop
  // over all fo these objects and then extract all the error messages
  // into a new array.
  const errors = Object.values(err.errors).map((el) => el.message); // This returns a new array

  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other uknown error: don't want to leak the details to the client.
    // Only send details to the developers.

    // 1) Log the error
    console.error("ERROR 💥", err);

    // 2) Send generic message: Sending NON-OPERATIONAL ERROR
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  // err.stack will show us where the error has happened.
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500; // 500 means internal server error
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res);

  if (process.env.NODE_ENV === "production") {
    // We separately include err.name cuz it is the constructor of CastError that
    // creates the name property
    let error = { ...err };
    error.message = err.message;

    // CastError and ValidationError is created by Mongoose.

    // CastError will come from example: we update a tour with invalid ratingsAverage
    // or difficulty, etc.
    if (error.name === "CastError") error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    if (error.name === "JsonWebTokenError") error = handleJWTError(error);

    if (error.name === "TokenExpiredError")
      error = handleJWTExpiredError(error);

    sendErrorProd(error, res);
  }
};
