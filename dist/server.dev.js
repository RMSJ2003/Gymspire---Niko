"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mongoose = require('mongoose'); // These 2 lines of code should be in the top cuz app can only access dotenv if it is already configured.


var dotenv = require('dotenv');

process.on('uncaughtException', function (err) {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
dotenv.config({
  path: './config.env'
}); // This only happen once, other files can access the env variables cuz we are in the same process.

dotenv.config({
  path: './config.env'
});
var DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, _defineProperty({
  useNewUrlParser: true,
  useUnifiedTopology: true
}, "useNewUrlParser", true)).then(function () {
  return console.log('DB connection successful!');
});

var app = require('./app');

var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log("App running on port ".concat(port, "..."));
}); // In unhandledRejection, crashing the application is OPTIONAL.

process.on('unhandledRejection', function (err) {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message); // Close the server first. This will finish all the pending requests and then shut down.

  server.close(function () {
    // paramt = 0 if success and 1 if uncaught exception.
    // The app will crash due to the process.exit which is destructive to currently running or pending requests which is a problem.
    // The solution is to first close the server and only then we shut down the application.
    process.exit(1);
  });
});