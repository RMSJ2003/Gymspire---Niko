"use strict";

var crypto = require("crypto");

var mongoose = require("mongoose");

var _require = require("os"),
    type = _require.type;

var validator = require("validator");

var bcrypt = require("bcryptjs");

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email address"
    }
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    // length of passwords is more important than crazy symbols
    select: false // If we read all users then password field won't show up but if we sign up user it will still show up (encrypted version)

  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    // Custom Validator to confirm password.
    validate: {
      // THIS ONLY WORKS ON CREATE AND SAVE !!! (.save and .create in mongoose)
      // We can't use arrow function cuz we need this keyword
      // A validator function returns a boolean if it's validated
      validator: function validator(el) {
        // If passwordConfirm == password, from doc
        return el === this.password;
      },
      message: "Passwords are not the same!"
    }
  },
  userType: {
    type: String,
    "enum": ["user", "coach", "admin"],
    "default": "user"
  },
  username: {
    type: String,
    required: [true, "Please provide your username"],
    // NOT SURE ABOUT THESE:
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [20, "Username must be at most 20 characters"],
    match: [/^[a-zA-Z0-9._-]+$/, "Username may only contain letters, numbers, dots, underscores, and hyphens"]
  },
  pfpUrl: {
    type: String
  },
  // quote: {
  //     type: String,
  //     trim: true // *is this really needed?
  // },
  // beforeImgUrl: String,  // *is this really needed?
  // beforeWeight: Number, // *is this really needed?
  // afterImgUrl: String, // *is this really needed?
  // afterWeight: Number, // *is this really needed?
  passwordChangedAt: Date,
  // The value of this field will change when someone change the password.
  passwordResetToken: String,
  passwordResetExpires: Date // timer do reset the password

}); // START OF COMMENT FOR IMPORTING DEV DATA

userSchema.pre("save", function _callee(next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified("password")) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(this.password, 13));

        case 4:
          this.password = _context.sent;
          this.passwordConfirm = undefined;
          next();

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
}); // Reset Password Middleware

userSchema.pre("save", function (next) {
  // If not modified OR the document is new, then return right away and proceed to the middleware
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // update last update date

  next();
}); // END OF COMMENT FOR IMPORTING DEV DATA
// Query middleware
// Regular Expressino (RegEx) /^find/ means a string that starts with "find"

userSchema.pre(/^find/, function (next) {
  // "this" points to the current query
  this.find({
    active: {
      $ne: false
    }
  });
  next();
});

userSchema.methods.correctPassword = function _callee2(candidatePassword, userPassword) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(bcrypt.compare(candidatePassword, userPassword));

        case 2:
          return _context2.abrupt("return", _context2.sent);

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // just finished this middleware functin - continue
  if (this.passwordChangedAt) {
    // The second param of parseInt is the base, which we set to base 10 number
    // returns the seconds
    // We used parse function to turn ms to s
    // returns the date as seconds since Jan 1, 1970 (UNIX epoch).
    var changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // e.g. iat (issued at / created at) is at time 100 and we changed password at time 200
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // resetToken should be cryptographically strong as the password hash
  var resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256") // type of hash
  .update(resetToken) // which string?
  .digest("hex"); // type of string
  // We are logging the resetToken as an object cuz this way, we'll se the variable name along with its value

  console.log({
    resetToken: resetToken
  }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

var User = mongoose.model("User", userSchema);
module.exports = User;