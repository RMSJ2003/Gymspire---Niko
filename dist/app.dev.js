"use strict";

var path = require("path");

var express = require("express");

var cookieParser = require("cookie-parser");

var AppError = require("./utils/appError");

var globalErrorHandler = require("./controllers/errorController");

var userRouter = require("./routes/userRoutes");

var authRouter = require('./routes/authRoutes');

var workoutPlanRouter = require("./routes/workoutPlanRoutes");

var prRouter = require("./routes/prRoutes");

var challengeRouter = require("./routes/challengeRoutes");

var workoutLogRouter = require("./routes/workoutLogRoutes");

var exerciseDbApiRouter = require("./routes/exerciseDbApiRoutes");

var exerciseRouter = require("./routes/exerciseRoutes");

var adminRouter = require("./routes/adminRoutes");

var viewRouter = require("./routes/viewRoutes");

var app = express();

var authController = require('./controllers/authController'); // 🔹 ADD THIS
// BODY + COOKIES


app.use(express.json({
  limit: "10kb"
}));
app.use(cookieParser());
app.use(express.urlencoded({
  extended: true
}));
app.use(express["static"]("public")); // VIEW ENGINE

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views")); // 🔹 API ROUTES FIRST (VERY IMPORTANT)

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/workout-plans", workoutPlanRouter);
app.use("/api/v1/prs", prRouter);
app.use("/api/v1/challenges", challengeRouter);
app.use("/api/v1/workout-logs", workoutLogRouter);
app.use("/api/v1/exercise-db-api", exerciseDbApiRouter);
app.use("/api/v1/exercises", exerciseRouter);
app.use("/api/v1/admin", adminRouter); // 🔹 VIEW ROUTES LAST

app.use(authController.isLoggedIn);
app.use("/", viewRouter); // 404 HANDLER

app.use(function (req, res, next) {
  next(new AppError("Can't find ".concat(req.originalUrl), 404));
});
app.use(globalErrorHandler);
module.exports = app;