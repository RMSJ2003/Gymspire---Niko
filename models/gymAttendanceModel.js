const mongoose = require("mongoose");

// Records every physical gym visit — whether the user logged a workout or not.
// This is what answers the panelist question:
// "What if the user is at the gym but didn't log a workout?"
const gymAttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  checkinTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  checkoutTime: {
    type: Date,
    default: null,
  },
  // How they got recorded — manual tap or auto (started a workout)
  source: {
    type: String,
    enum: ["manual", "workout"],
    default: "manual",
  },
  // Computed on checkout — duration in minutes
  durationMinutes: {
    type: Number,
    default: null,
  },
});

module.exports = mongoose.model("GymAttendance", gymAttendanceSchema);
