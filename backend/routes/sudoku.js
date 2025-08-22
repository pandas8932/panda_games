const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const SudokuGame = require('../models/sudokuGame');
const User = require('../models/user');
const Game = require('../models/game');
const GameHistory = require('../models/gameHistory');
const auth = require('../middlewares/user');

// Load Sudoku levels from file
const loadSudokuLevels = () => {
  try {
    const levelsPath = path.join(__dirname, '../sudokuLevels.txt');
    const content = fs.readFileSync(levelsPath, 'utf8');
    const levels = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [difficulty, level, puzzle, solution] = line.split(',');
        if (difficulty && level && puzzle && solution) {
          if (!levels[difficulty]) levels[difficulty] = {};
          levels[difficulty][parseInt(level)] = { puzzle, solution };
        }
      }
    });
    
    return levels;
  } catch (error) {
    console.error('Error loading Sudoku levels:', error);
    return {};
  }
};

// Convert string to 2D array
const stringToGrid = (str) => {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    grid[i] = [];
    for (let j = 0; j < 9; j++) {
      grid[i][j] = parseInt(str[i * 9 + j]);
    }
  }
  return grid;
};

// Generate a valid Sudoku puzzle
const generateSudokuPuzzle = (difficulty, level) => {
  const levels = loadSudokuLevels();
  
  if (levels[difficulty] && levels[difficulty][level]) {
    const levelData = levels[difficulty][level];
    const puzzle = stringToGrid(levelData.puzzle);
    const solution = stringToGrid(levelData.solution);
    return { puzzle, solution };
  }
  
  // Fallback to random generation if level not found
  const solution = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];

  const puzzle = solution.map(row => [...row]);
  const cellsToRemove = {
    easy: 30,
    medium: 45,
    hard: 55
  };

  const cellsToRemoveCount = cellsToRemove[difficulty] || 30;
  const positions = [];
  
  for (let i = 0; i < 81; i++) {
    positions.push(i);
  }
  
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < cellsToRemoveCount; i++) {
    const pos = positions[i];
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    puzzle[row][col] = 0;
  }

  return { puzzle, solution };
};

// Validate Sudoku solution
const isValidSudoku = (grid) => {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] !== 0) {
        if (seen.has(grid[row][col])) return false;
        seen.add(grid[row][col]);
      }
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      if (grid[row][col] !== 0) {
        if (seen.has(grid[row][col])) return false;
        seen.add(grid[row][col]);
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set();
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          if (grid[row][col] !== 0) {
            if (seen.has(grid[row][col])) return false;
            seen.add(grid[row][col]);
          }
        }
      }
    }
  }

  return true;
};

// Check if puzzle is completed
const isPuzzleCompleted = (userGrid, solution) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (userGrid[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
};

// Get user's current progress
router.get('/progress', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const progress = await SudokuGame.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: {
        _id: '$difficulty',
        completedLevels: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        totalTime: { $sum: '$timeSpent' },
        totalCoins: { $sum: '$coinsEarned' }
      }}
    ]);

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p._id] = {
        completedLevels: p.completedLevels,
        totalTime: p.totalTime,
        totalCoins: p.totalCoins
      };
    });

    res.json({
      easy: progressMap.easy || { completedLevels: 0, totalTime: 0, totalCoins: 0 },
      medium: progressMap.medium || { completedLevels: 0, totalTime: 0, totalCoins: 0 },
      hard: progressMap.hard || { completedLevels: 0, totalTime: 0, totalCoins: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
});

// Start a new Sudoku game
router.post('/start', auth, async (req, res) => {
  try {
    const { difficulty, level } = req.body;
    const userId = req.user.id;

    if (!difficulty || !level || level < 1 || level > 30) {
      return res.status(400).json({ message: 'Invalid difficulty or level' });
    }

    // Check if user can play this level (must complete previous levels first)
    if (level > 1) {
      const previousLevelCompleted = await SudokuGame.findOne({
        userId,
        difficulty,
        level: level - 1,
        isCompleted: true
      });

      if (!previousLevelCompleted) {
        return res.status(400).json({ message: 'Complete level ' + (level - 1) + ' first' });
      }
    }

    // Generate puzzle
    const { puzzle, solution } = generateSudokuPuzzle(difficulty, level);
    
    // Create or update game
    const game = await SudokuGame.findOneAndUpdate(
      { userId, difficulty, level },
      {
        puzzle,
        solution,
        userGrid: puzzle.map(row => [...row]),
        pencilMarks: Array(9).fill().map(() => Array(9).fill().map(() => [])),
        isCompleted: false,
        timeSpent: 0,
        startedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      gameId: game._id,
      puzzle: game.puzzle,
      userGrid: game.userGrid,
      pencilMarks: game.pencilMarks,
      difficulty,
      level
    });

  } catch (error) {
    res.status(500).json({ message: 'Error starting game', error: error.message });
  }
});

// Update game state (place number, pencil marks, etc.)
router.post('/update', auth, async (req, res) => {
  try {
    const { gameId, row, col, number, pencilMark, timeSpent } = req.body;
    const userId = req.user.id;

    const game = await SudokuGame.findOne({ _id: gameId, userId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.isCompleted) {
      return res.status(400).json({ message: 'Game already completed' });
    }

    // Update user grid or pencil marks
    if (pencilMark !== undefined) {
      // Toggle pencil mark
      const currentMarks = game.pencilMarks[row][col];
      const markIndex = currentMarks.indexOf(number);
      
      if (markIndex > -1) {
        currentMarks.splice(markIndex, 1);
      } else {
        currentMarks.push(number);
        currentMarks.sort();
      }
      
      game.pencilMarks[row][col] = currentMarks;
    } else if (number !== undefined) {
      // Place number
      game.userGrid[row][col] = number;
      game.pencilMarks[row][col] = []; // Clear pencil marks
    } else if (updates.autoMark) {
      // Auto-mark update - pencil marks are already calculated on frontend
      // Just update the time spent
    }

    // Update time spent
    if (timeSpent !== undefined) {
      game.timeSpent = timeSpent;
    }

    // Check if puzzle is completed
    if (isPuzzleCompleted(game.userGrid, game.solution)) {
      game.isCompleted = true;
      game.completedAt = new Date();
      
      // Calculate coins earned based on difficulty
      const coinRewards = { easy: 10, medium: 20, hard: 30 };
      game.coinsEarned = coinRewards[game.difficulty] || 10;
      
      // Update user's coins
      const user = await User.findById(userId);
      user.coins += game.coinsEarned;
      await user.save();

      // Record in game history
      const sudokuGameInfo = await Game.findOne({ route: '/games/sudoku' });
      if (sudokuGameInfo) {
        const gameHistory = new GameHistory({
          userId: user._id,
          gameId: sudokuGameInfo._id,
          gameName: sudokuGameInfo.title,
          betAmount: 0,
          result: 'win',
          coinsWon: game.coinsEarned,
          coinsLost: 0,
          gameData: {
            difficulty: game.difficulty,
            level: game.level,
            timeSpent: game.timeSpent
          }
        });
        await gameHistory.save();
      }
    }

    await game.save();

    res.json({
      success: true,
      userGrid: game.userGrid,
      pencilMarks: game.pencilMarks,
      isCompleted: game.isCompleted,
      coinsEarned: game.coinsEarned,
      timeSpent: game.timeSpent
    });

  } catch (error) {
    res.status(500).json({ message: 'Error updating game', error: error.message });
  }
});

// Reset game
router.post('/reset', auth, async (req, res) => {
  try {
    const { gameId } = req.body;
    const userId = req.user.id;

    const game = await SudokuGame.findOne({ _id: gameId, userId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Reset to original puzzle state
    game.userGrid = game.puzzle.map(row => [...row]);
    game.pencilMarks = Array(9).fill().map(() => Array(9).fill().map(() => []));
    game.timeSpent = 0;
    game.startedAt = new Date();
    game.isCompleted = false;
    game.completedAt = null;
    game.coinsEarned = 0;

    await game.save();

    res.json({
      success: true,
      userGrid: game.userGrid,
      pencilMarks: game.pencilMarks,
      timeSpent: 0
    });

  } catch (error) {
    res.status(500).json({ message: 'Error resetting game', error: error.message });
  }
});

// Get current game state
router.get('/game/:gameId', auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    const game = await SudokuGame.findOne({ _id: gameId, userId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({
      success: true,
      puzzle: game.puzzle,
      userGrid: game.userGrid,
      pencilMarks: game.pencilMarks,
      difficulty: game.difficulty,
      level: game.level,
      isCompleted: game.isCompleted,
      timeSpent: game.timeSpent,
      coinsEarned: game.coinsEarned,
      startedAt: game.startedAt
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching game', error: error.message });
  }
});

module.exports = router;
