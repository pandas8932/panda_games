const mongoose = require("mongoose");

const gameHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  betAmount: {
    type: Number,
    required: true
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'draw'],
    required: true
  },
  coinsWon: {
    type: Number,
    default: 0
  },
  coinsLost: {
    type: Number,
    default: 0
  },
  gameData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for better query performance
gameHistorySchema.index({ userId: 1, playedAt: -1 });
gameHistorySchema.index({ gameId: 1, playedAt: -1 });

module.exports = mongoose.model("GameHistory", gameHistorySchema);
