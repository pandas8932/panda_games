const mongoose = require("mongoose");

const sudokuGameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  puzzle: {
    type: [[Number]], // 9x9 grid
    required: true
  },
  solution: {
    type: [[Number]], // 9x9 grid
    required: true
  },
  userGrid: {
    type: [[Number]], // Current state of user's grid
    required: true
  },
  pencilMarks: {
    type: [[[Number]]], // 9x9x9 array for pencil marks
    default: Array(9).fill().map(() => Array(9).fill().map(() => []))
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Index for better query performance
sudokuGameSchema.index({ userId: 1, difficulty: 1, level: 1 });
sudokuGameSchema.index({ userId: 1, isCompleted: 1 });

module.exports = mongoose.model("SudokuGame", sudokuGameSchema);
