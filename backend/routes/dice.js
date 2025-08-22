const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Game = require('../models/game');
const GameHistory = require('../models/gameHistory');
const auth = require('../middlewares/user');

// Get dice game info
router.get('/info', async (req, res) => {
  try {
    const diceGame = await Game.findOne({ route: '/games/dicegame' });
    if (!diceGame) {
      return res.status(404).json({ message: 'Dice game not found' });
    }
    res.json(diceGame);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dice game info', error: error.message });
  }
});

// Play dice game
router.post('/play', auth, async (req, res) => {
  try {
    const { bet, target, over } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!bet || bet <= 0 || !target || target < 2 || target > 99) {
      return res.status(400).json({ message: 'Invalid bet or target' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow playing with 0 coins, but check if user has enough coins for non-zero bets
    if (bet > 0 && user.coins < bet) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    // Get dice game info
    const diceGame = await Game.findOne({ route: '/games/dicegame' });
    if (!diceGame) {
      return res.status(404).json({ message: 'Dice game not found' });
    }

    // Generate random dice roll (1-100)
    const rolled = Math.floor(Math.random() * 100) + 1;

    // Determine win/loss
    let win = false;
    let multiplier = 1;

    if (over) {
      win = rolled > target;
      // Calculate multiplier based on probability
      const probability = (100 - target) / 100;
      multiplier = probability > 0 ? 0.99 / probability : 1;
    } else {
      win = rolled < target;
      // Calculate multiplier based on probability
      const probability = target / 100;
      multiplier = probability > 0 ? 0.99 / probability : 1;
    }

    // Calculate winnings/losses
    let coinsWon = 0;
    let coinsLost = 0;

    if (win) {
      coinsWon = Math.round((bet * multiplier) * 100) / 100;
      user.coins += coinsWon;
    } else if (bet > 0) {
      coinsLost = bet;
      user.coins -= coinsLost;
    }

    await user.save();

    // Record game history
    const gameHistory = new GameHistory({
      userId: user._id,
      gameId: diceGame._id,
      gameName: diceGame.title,
      betAmount: bet,
      result: win ? 'win' : 'loss',
      coinsWon: coinsWon,
      coinsLost: coinsLost,
      gameData: {
        target: target,
        over: over,
        rolled: rolled,
        multiplier: multiplier
      }
    });

    await gameHistory.save();

    res.json({
      win: win,
      rolled: rolled,
      target: target,
      over: over,
      multiplier: multiplier,
      bet: bet,
      winnings: coinsWon,
      balance: user.coins,
      message: win ? 'Congratulations! You won!' : 'Better luck next time!'
    });

  } catch (error) {
    console.error('Dice game error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's dice game history
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const diceGame = await Game.findOne({ route: '/games/dicegame' });
    if (!diceGame) {
      return res.status(404).json({ message: 'Dice game not found' });
    }

    const history = await GameHistory.find({ 
      userId: req.user.id,
      gameId: diceGame._id 
    })
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GameHistory.countDocuments({ 
      userId: req.user.id,
      gameId: diceGame._id 
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
    res.status(500).json({ message: 'Error fetching dice history', error: error.message });
  }
});

module.exports = router;
