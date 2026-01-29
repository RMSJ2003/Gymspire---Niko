const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  exerciseId: String,
  name: String,
  gifURL: String,
  target: String,
  instructions: [String]
});

module.exports = mongoose.model('Exercise', exerciseSchema);