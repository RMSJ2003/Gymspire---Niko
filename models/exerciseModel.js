const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  exerciseId: String,
  name: String,
  gifURL: String,
  target: String,
  instructions: [String],
  gifWorking: {
    type: Boolean,
    default: true,
    select: false, // We set select to false cuz we don't want users to see active field
  },
});

exerciseSchema.pre(/^find/, function (next) {
  // 🔥 Allow bypassing inactive filter when explicitly requested
  if (this.getOptions().includeInactive) {
    return next();
  }

  this.find({ gifWorking: { $ne: false } });
  next();
});

module.exports = mongoose.model("Exercise", exerciseSchema);
