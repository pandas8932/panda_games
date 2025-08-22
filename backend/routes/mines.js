const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Game = require("../models/game");
const GameHistory = require("../models/gameHistory");
const auth = require("../middlewares/user");

// In-memory storage for active games (in production, use Redis or database)
const activeGames = new Map();

// Rate limiting for tile reveals (prevent rapid clicking)
const lastRevealTime = new Map();

// Multiplier table data (diamonds x bombs) - exact values from user data
const multiplierTable = [
  // 1 Diamond
  [1.03, 1.08, 1.12, 1.18, 1.24, 1.30, 1.37, 1.46, 1.55, 1.65, 1.77, 1.90, 2.06, 2.25, 2.47, 2.75, 3.09, 3.54, 4.12, 4.95, 6.19, 8.25, 12.37, 24.75],
  // 2 Diamonds
  [1.08, 1.17, 1.29, 1.41, 1.56, 1.74, 1.94, 2.18, 2.47, 2.83, 3.26, 3.81, 4.50, 5.40, 6.60, 8.25, 10.61, 14.14, 19.80, 29.70, 49.50, 99, 297],
  // 3 Diamonds
  [1.12, 1.29, 1.48, 1.71, 2.00, 2.35, 2.79, 3.35, 4.07, 5.00, 6.26, 7.96, 10.35, 13.80, 18.97, 27.11, 40.66, 65.06, 113.85, 227.70, 596.25, 2277],
  // 4 Diamonds
  [1.18, 1.41, 1.71, 2.09, 2.58, 3.23, 4.09, 5.26, 6.88, 9.17, 12.51, 17.52, 25.30, 37.95, 59.64, 99.39, 178.91, 357.81, 834.90, 2504.70, 12523.50],
  // 5 Diamonds
  [1.24, 1.56, 2.00, 2.58, 3.39, 4.52, 6.14, 8.50, 12.04, 17.52, 26.27, 40.87, 66.41, 113.85, 208.72, 417.45, 939.26, 2504.70, 8766.45, 52598.70],
  // 6 Diamonds
  [1.30, 1.74, 2.35, 3.32, 4.52, 6.46, 9.44, 14.17, 21.89, 35.03, 58.38, 102.17, 189.75, 379.50, 834.90, 2087.25, 6261.75, 25047, 175329],
  // 7 Diamonds
  [1.37, 1.94, 2.79, 4.09, 6.14, 9.44, 14.95, 24.47, 41.60, 73.95, 138.66, 277.33, 600.87, 1442.10, 3965.77, 13219.25, 59486.62, 475893],
  // 8 Diamonds
  [1.46, 2.18, 3.35, 5.26, 8.50, 14.17, 24.47, 44.05, 83.20, 166.40, 356.56, 831.98, 2163.15, 6489.45, 23794.65, 118973.25, 1070759.25],
  // 9 Diamonds
  [1.55, 2.47, 4.07, 6.88, 12.04, 21.89, 41.60, 83.20, 176.80, 404.10, 1010.26, 2828.73, 9193.39, 36773.55, 202254.52, 2022545.25],
  // 10 Diamonds
  [1.65, 2.83, 5.00, 9.17, 17.52, 35.03, 73.95, 166.50, 404.10, 1077.61, 3232.84, 11314.94, 49301.40, 294188.40, 3236072.40],
  // 11 Diamonds
  [1.77, 3.26, 6.26, 15.21, 26.27, 58.38, 138.66, 356.56, 1010.26, 3232.84, 12123.15, 56574.69, 367735.50, 4412826],
  // 12 Diamonds
  [1.90, 3.81, 7.96, 17.52, 40.87, 102.17, 277.33, 831.98, 2828.73, 11314.94, 56574.69, 396022.85, 5148297],
  // 13 Diamonds
  [2.06, 4.50, 10.35, 25.30, 66.41, 189.75, 600.87, 2163.15, 9139.39, 49031.40, 367735.50, 5148297],
  // 14 Diamonds
  [2.25, 5.40, 13.80, 37.95, 113.85, 379.50, 1442.10, 6489.45, 36773.55, 294188.40, 4412826],
  // 15 Diamonds
  [2.47, 6.60, 18.97, 59.64, 208.72, 834.90, 3965.77, 23794.65, 202254.52, 3236072.40],
  // 16 Diamonds
  [2.75, 8.25, 27.11, 99.39, 417.45, 2087.25, 13219.25, 118973.25, 2022545.25],
  // 17 Diamonds
  [3.09, 10.61, 40.66, 178.91, 939.26, 6261.75, 59486.62, 1070759.25],
  // 18 Diamonds
  [3.54, 14.14, 65.06, 357.81, 2504.70, 25047, 475893],
  // 19 Diamonds
  [4.12, 19.80, 113.85, 834.90, 8766.45, 175329],
  // 20 Diamonds
  [4.95, 29.70, 227.70, 2504.70, 52598.70],
  // 21 Diamonds
  [6.19, 49.50, 596.25, 12523.50],
  // 22 Diamonds
  [8.25, 99, 2277],
  // 23 Diamonds
  [12.38, 297],
  // 24 Diamonds
  [24.75]
];

// Calculate multiplier based on multiplier table
const calculateMultiplier = (mines, tilesRevealed) => {
  // Validate inputs
  if (mines < 1 || mines > 24) return 1;
  if (tilesRevealed < 0 || tilesRevealed > 24) return 1;
  
  // Get multiplier from table
  // Note: Array indices are 0-based, so subtract 1
  const diamonds = tilesRevealed; // tiles revealed = diamonds
  const minesIndex = mines - 1; // mines column index
  
  // Check if the combination exists in the table
  if (diamonds < multiplierTable.length && minesIndex < multiplierTable[diamonds].length) {
    return multiplierTable[diamonds][minesIndex];
  }
  
  // Fallback for edge cases
  return 1;
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

// Create client-safe grid (without mine information)
const createClientGrid = (grid, revealedTiles) => {
  return grid.map(tile => ({
    id: tile.id,
    revealed: revealedTiles.includes(tile.id),
    isMine: revealedTiles.includes(tile.id) ? tile.isMine : false, // Only reveal mine info if tile was revealed
    multiplier: tile.multiplier
  }));
};

// Start a new mines game
router.post("/start", auth, async (req, res) => {
  try {
    const { bet, mines } = req.body;
    const userId = req.user.id;

    // Validate input - allow 0 bet
    if (bet === undefined || bet < 0 || bet > 10000) {
      return res.status(400).json({ message: "Invalid bet amount" });
    }
    
    if (!mines || mines < 1 || mines > 24) {
      return res.status(400).json({ message: "Invalid number of mines" });
    }

    // Check if user has enough balance (allow 0 bet)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    if (bet > 0 && user.coins < bet) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct bet from balance (only if bet > 0)
    if (bet > 0) {
      user.coins -= bet;
      await user.save();
    }

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
      grid: createClientGrid(grid, []), // Send client-safe grid
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

    // Rate limiting - prevent rapid clicking
    const now = Date.now();
    const lastReveal = lastRevealTime.get(userId) || 0;
    if (now - lastReveal < 500) { // 500ms minimum between reveals
      return res.status(429).json({ message: "Please wait before revealing another tile" });
    }
    lastRevealTime.set(userId, now);

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
        grid: createClientGrid(game.grid, game.revealedTiles), // Send client-safe grid
        message: "You hit a mine! Game over."
      });

    } else {
      // Safe tile - update multiplier using table
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
        
        const winnings = Math.round((game.bet * newMultiplier) * 100) / 100;
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
          grid: createClientGrid(game.grid, game.revealedTiles), // Send client-safe grid
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
          grid: createClientGrid(game.grid, game.revealedTiles), // Send client-safe grid
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

    // Calculate winnings using current multiplier
    const winnings = Math.round((game.bet * game.currentMultiplier) * 100) / 100;
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const minesGame = await Game.findOne({ route: '/games/minesgame' });
    if (!minesGame) {
      return res.status(404).json({ message: 'Mines game not found' });
    }

    const history = await GameHistory.find({ 
      userId: req.user.id,
      gameId: minesGame._id 
    })
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GameHistory.countDocuments({ 
      userId: req.user.id,
      gameId: minesGame._id 
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
    console.error("Mines history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to save game history
const saveGameHistory = async (userId, bet, mines, tilesRevealed, multiplier, win, payout) => {
  try {
    // Get mines game info
    const minesGame = await Game.findOne({ route: '/games/minesgame' });
    if (!minesGame) {
      console.error('Mines game not found in database');
      return;
    }

    // Create game history record
    const gameHistory = new GameHistory({
      userId: userId,
      gameId: minesGame._id,
      gameName: minesGame.title,
      betAmount: bet,
      result: win ? 'win' : 'loss',
      coinsWon: win ? payout : 0,
      coinsLost: win ? 0 : bet,
      gameData: {
        mines: mines,
        tilesRevealed: tilesRevealed,
        multiplier: multiplier,
        payout: payout
      }
    });

    await gameHistory.save();
    console.log(`Game history saved: User ${userId}, Bet ${bet}, Mines ${mines}, Tiles ${tilesRevealed}, Multiplier ${multiplier}, Win ${win}, Payout ${payout}`);
  } catch (error) {
    console.error('Error saving game history:', error);
  }
};

module.exports = router;
