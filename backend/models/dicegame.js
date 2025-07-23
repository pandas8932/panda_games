const mongoose = require("mongoose");

const diceGameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bet: Number,
  target: Number,
  over: Boolean,
  rolled: Number,
  win: Boolean,
  payout: Number,
  playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DiceGame", diceGameSchema);
