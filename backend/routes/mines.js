const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middlewares/user");

// In-memory storage for active games (in production, use Redis or database)
const activeGames = new Map();

// Calculate multiplier based on mines and tiles revealed
const calculateMultiplier = (mines, tilesRevealed) => {
  const totalTiles = 25;
  const safeTiles = totalTiles - mines;
  
  if (tilesRevealed === 0) return 1;
  
  // Calculate probability of revealing this many safe tiles
  let probability = 1;
  for (let i = 0; i < tilesRevealed; i++) {
    probability *= (safeTiles - i) / (totalTiles - i);
  }
  
  // Return inverse of probability as multiplier (house edge included)
  return Math.max(1, (1 / probability) * 0.95);
};

// Generate random grid with mines
const generateGrid = (mines) => {
  const grid = Array(25).fill(null).map((_, index) => ({
    id: index,
    isMine: false,
    multiplier: 1,
    revealed: false
  }));
  
  // Place mines randomly
  const minePositions = new Set();
  while (minePositions.size < mines) {
    minePositions.add(Math.floor(Math.random() * 25));
  }
  
  minePositions.forEach(pos => {
    grid[pos].isMine = true;
  });
  
  return grid;
};

// Start a new mines game
router.post("/start", auth, async (req, res) => {
  try {
    const { bet, mines } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!bet || bet < 1 || bet > 10000) {
      return res.status(400).json({ message: "Invalid bet amount" });
    }
    
    if (!mines || mines < 1 || mines > 24) {
      return res.status(400).json({ message: "Invalid number of mines" });
    }

    // Check if user has enough balance
    const user = await User.findById(userId);
    if (!user || user.coins < bet) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct bet from balance
    user.coins -= bet;
    await user.save();

    // Generate game grid
    const grid = generateGrid(mines);
    
    // Store game state
    const gameId = `${userId}_${Date.now()}`;
    activeGames.set(gameId, {
      userId,
      bet,
      mines,
      grid,
      revealedTiles: [],
      currentMultiplier: 1,
      gameStarted: true,
      gameOver: false
    });

    res.json({
      success: true,
      gameId,
      grid,
      balance: user.coins,
      message: "Game started successfully"
    });

  } catch (error) {
    console.error("Mines start error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reveal a tile
router.post("/reveal", auth, async (req, res) => {
  try {
    const { tileId } = req.body;
    const userId = req.user.id;

    // Find active game for user
    let gameId = null;
    let game = null;
    
    for (const [id, g] of activeGames.entries()) {
      if (g.userId === userId && g.gameStarted && !g.gameOver) {
        gameId = id;
        game = g;
        break;
      }
    }

    if (!game) {
      return res.status(400).json({ message: "No active game found" });
    }

    // Validate tile
    if (tileId < 0 || tileId >= 25 || game.revealedTiles.includes(tileId)) {
      return res.status(400).json({ message: "Invalid tile" });
    }

    const tile = game.grid[tileId];
    game.revealedTiles.push(tileId);

    if (tile.isMine) {
      // Game over - hit a mine
      game.gameOver = true;
      game.gameStarted = false;
      
      // Reveal all mines
      game.grid.forEach(t => {
        if (t.isMine) t.revealed = true;
      });

      activeGames.delete(gameId);

      // Get current user balance
      const user = await User.findById(userId);

      res.json({
        success: true,
        isMine: true,
        gameOver: true,
        win: false,
        multiplier: game.currentMultiplier,
        newBalance: user.coins,
        grid: game.grid,
        message: "You hit a mine! Game over."
      });

    } else {
      // Safe tile - update multiplier
      const tilesRevealed = game.revealedTiles.length;
      const newMultiplier = calculateMultiplier(game.mines, tilesRevealed);
      game.currentMultiplier = newMultiplier;

      // Check if all safe tiles are revealed
      const safeTiles = 25 - game.mines;
      const gameEnded = tilesRevealed === safeTiles;

      if (gameEnded) {
        // All safe tiles revealed - automatic win
        game.gameOver = true;
        game.gameStarted = false;
        
        const winnings = Math.floor(game.bet * newMultiplier);
        const user = await User.findById(userId);
        user.coins += winnings;
        await user.save();

        // Save to history
        await saveGameHistory(userId, game.bet, game.mines, tilesRevealed, newMultiplier, true, winnings);

        activeGames.delete(gameId);

        res.json({
          success: true,
          isMine: false,
          gameEnded: true,
          gameOver: true,
          win: true,
          multiplier: newMultiplier,
          newBalance: user.coins,
          winnings,
          grid: game.grid,
          message: "Congratulations! You revealed all safe tiles!"
        });
      } else {
        // Get current user balance for safe tile reveal
        const user = await User.findById(userId);
        
        res.json({
          success: true,
          isMine: false,
          gameEnded: false,
          multiplier: newMultiplier,
          newBalance: user.coins,
          grid: game.grid,
          message: "Safe tile revealed!"
        });
      }
    }

  } catch (error) {
    console.error("Mines reveal error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cash out from current game
router.post("/cashout", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find active game for user
    let gameId = null;
    let game = null;
    
    for (const [id, g] of activeGames.entries()) {
      if (g.userId === userId && g.gameStarted && !g.gameOver) {
        gameId = id;
        game = g;
        break;
      }
    }

    if (!game) {
      return res.status(400).json({ message: "No active game found" });
    }

    // Calculate winnings
    const winnings = Math.floor(game.bet * game.currentMultiplier);
    const tilesRevealed = game.revealedTiles.length;

    // Update user balance
    const user = await User.findById(userId);
    user.coins += winnings;
    await user.save();

    // Save to history
    await saveGameHistory(userId, game.bet, game.mines, tilesRevealed, game.currentMultiplier, true, winnings);

    // End game
    game.gameOver = true;
    game.gameStarted = false;
    activeGames.delete(gameId);

    res.json({
      success: true,
      win: true,
      winnings,
      balance: user.coins,
      multiplier: game.currentMultiplier,
      tilesRevealed,
      message: "Successfully cashed out!"
    });

  } catch (error) {
    console.error("Mines cashout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get game history
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real app, you'd have a separate history collection
    // For now, we'll return a mock history
    const history = [
      {
        bet: 10,
        mines: 3,
        tilesRevealed: 5,
        multiplier: 2.5,
        win: true,
        payout: 25,
        timestamp: new Date()
      },
      {
        bet: 20,
        mines: 5,
        tilesRevealed: 3,
        multiplier: 1.8,
        win: true,
        payout: 36,
        timestamp: new Date(Date.now() - 3600000)
      }
    ];

    res.json(history);

  } catch (error) {
    console.error("Mines history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to save game history (in production, use a database)
const saveGameHistory = async (userId, bet, mines, tilesRevealed, multiplier, win, payout) => {
  // In a real app, save to a history collection
  console.log(`Game history: User ${userId}, Bet ${bet}, Mines ${mines}, Tiles ${tilesRevealed}, Multiplier ${multiplier}, Win ${win}, Payout ${payout}`);
};

module.exports = router;
