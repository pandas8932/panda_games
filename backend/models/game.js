const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['earning', 'farming', 'room'],
    default: 'earning'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minBet: {
    type: Number,
    default: 10
  },
  maxBet: {
    type: Number,
    default: 1000
  }
}, { timestamps: true });

module.exports = mongoose.model("Game", gameSchema);
