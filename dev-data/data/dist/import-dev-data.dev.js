"use strict";

var fs = require('fs');

var mongoose = require('mongoose');

var dotenv = require('dotenv'); // const User = require('../../models/userModel');
// const WorkoutPlan = require('../../models/workoutPlanModel');
// const WorkoutLog = require('../../models/workoutLogModel');
// const Challenge = require('../../models/challengeModel');


var Exercise = require('../../models/exerciseModel');

dotenv.config({
  path: './config.env'
});
var DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
main()["catch"](function (err) {
  return console.log(err);
}); // Connect to database

function main() {
  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(mongoose.connect(DB, {
            // Don't worry about these as these are just to solve the deprecation warnings.
            useUnifiedTopology: true,
            useNewUrlParser: true
          }));

        case 2:
          console.log('DB connection successful!');

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
} // READ JSON FILE 
// __dirname contains the absolute path of the directory where the current JavaScript file is located


var users = JSON.parse(fs.readFileSync("".concat(__dirname, "/users.json"), 'utf-8'));
var workoutLogs = JSON.parse(fs.readFileSync("".concat(__dirname, "/workoutLogs.json"), 'utf-8'));
var workoutPlans = JSON.parse(fs.readFileSync("".concat(__dirname, "/workoutPlan.json"), 'utf-8'));
var challenge = JSON.parse(fs.readFileSync("".concat(__dirname, "/challenge.json"), 'utf-8'));
var exerciseTemplates = JSON.parse(fs.readFileSync("".concat(__dirname, "/apiExercisesTemplate.json"), 'utf-8')); // IMPORT DATA INTO DB

var importData = function importData() {
  return regeneratorRuntime.async(function importData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Exercise.create(exerciseTemplates, {
            validateBeforeSave: false
          }));

        case 3:
          console.log('Data successfully loaded!');
          process.exit();
          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
}; // DELETE ALL DATA FROM DB


var deleteData = function deleteData() {
  return regeneratorRuntime.async(function deleteData$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(Exercise.deleteMany());

        case 3:
          console.log('Data successfully deleted!');
          process.exit();
          _context3.next = 10;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          console.log(_context3.t0);

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
}; // process.argv is the command you inputted


if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();