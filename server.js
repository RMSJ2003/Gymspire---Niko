const mongoose = require("mongoose");

// ===============================
// Handle uncaught exceptions
// ===============================
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// ===============================
// Load environment variables ONLY in development
// ===============================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./config.env" });
}

// ===============================
// Database connection
// ===============================
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// ===============================
// Start server
// ===============================
const app = require("./app");

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// ===============================
// Handle unhandled promise rejections
// ===============================
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
