"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mongoose = require("mongoose");

var dotenv = require("dotenv");

var User = require("./models/userModel"); // 👇 explicitly load config.env


dotenv.config({
  path: "./config.env"
});
var DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, _defineProperty({
  useNewUrlParser: true,
  useUnifiedTopology: true
}, "useNewUrlParser", true)).then(function () {
  return console.log('DB connection successful!');
});

(function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.create({
            email: "admin@iacademy.ph",
            username: "gymspire_admin",
            password: "Admin1234",
            passwordConfirm: "Admin1234",
            userType: "admin",
            pfpUrl: "admin picture"
          }));

        case 2:
          console.log("✅ Admin created");
          process.exit();

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
})();