const path = require("path");

const express = require("express");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const workoutPlanRouter = require("./routes/workoutPlanRoutes");
const prRouter = require("./routes/prRoutes");
const challengeRouter = require("./routes/challengeRoutes");
const workoutLogRouter = require("./routes/workoutLogRoutes");
const exerciseDbApiRouter = require("./routes/exerciseDbApiRoutes");
const exerciseRouter = require("./routes/exerciseRoutes");
const adminRouter = require("./routes/adminRoutes");
const viewRouter = require("./routes/viewRoutes");
const app = express();

app.use(
  express.json({
    limit: "10kb", // We set size for body so when the body is over 10kb, it will not be accepted.
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// 🔹 Set Pug as view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("/", viewRouter); // mounted in the root URL
app.use("/api/v1/users", userRouter);
app.use("/api/v1/workout-plans", workoutPlanRouter);
app.use("/api/v1/prs", prRouter);
app.use("/api/v1/challenges", challengeRouter);
app.use("/api/v1/workout-logs", workoutLogRouter);
app.use("/api/v1/exercise-db-api", exerciseDbApiRouter);
app.use("/api/v1/exercises", exerciseRouter);
app.use("/api/v1/admin", adminRouter);

// HANDLING OPERATIONAL ERROR
// This should be the last part after all the other routes.
// Handle ALL http requests (get, post, patch, delete, etc.)
// * stands for everything.
// GLOBAL ERROR HANDLER - Handle all errors
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler); // Should be last in app.use to catch error in prev codes/

module.exports = app;
