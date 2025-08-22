const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const GameHistory = require('../models/gameHistory');
const User = require('../models/user');
const auth = require('../middlewares/user');

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error.message });
  }
});

// Get games by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const games = await Game.find({ 
      category: category, 
      isActive: true 
    }).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games by category', error: error.message });
  }
});

// Get a specific game by ID
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game', error: error.message });
  }
});

// Create a new game (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin (you can add admin role to user model later)
    const newGame = new Game(req.body);
    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    res.status(400).json({ message: 'Error creating game', error: error.message });
  }
});

// Update a game (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedGame) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ message: 'Error updating game', error: error.message });
  }
});

// Delete a game (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedGame = await Game.findByIdAndDelete(req.params.id);
    if (!deletedGame) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting game', error: error.message });
  }
});

// Get user's game history
router.get('/history/user', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const history = await GameHistory.find({ userId: req.user.id })
      .populate('gameId', 'title image')
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GameHistory.countDocuments({ userId: req.user.id });

    res.json({
      history,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game history', error: error.message });
  }
});

// Get game history for a specific game
router.get('/history/game/:gameId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const history = await GameHistory.find({ 
      userId: req.user.id,
      gameId: req.params.gameId 
    })
      .populate('gameId', 'title image')
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GameHistory.countDocuments({ 
      userId: req.user.id,
      gameId: req.params.gameId 
    });

    res.json({
      history,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game history', error: error.message });
  }
});

// Record a game result
router.post('/history', auth, async (req, res) => {
  try {
    const { gameId, gameName, betAmount, result, coinsWon, coinsLost, gameData } = req.body;

    // Create game history record
    const gameHistory = new GameHistory({
      userId: req.user.id,
      gameId,
      gameName,
      betAmount,
      result,
      coinsWon: coinsWon || 0,
      coinsLost: coinsLost || 0,
      gameData: gameData || {}
    });

    await gameHistory.save();

    // Update user's coins
    const user = await User.findById(req.user.id);
    if (user) {
      user.coins += (coinsWon || 0) - (coinsLost || 0);
      await user.save();
    }

    res.status(201).json(gameHistory);
  } catch (error) {
    res.status(400).json({ message: 'Error recording game result', error: error.message });
  }
});

module.exports = router;
