const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const DiceGame = require("../../models/dicegame");
const userauth = require("../../middlewares/user");

// 🎲 POST /api/dice/play - Roll dice
router.post("/play", userauth, async (req, res) => {
  try {
    const { bet, target, over } = req.body;

    if (!bet || !target) {
      return res.status(400).json({ message: "Bet and target required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.coins < bet) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const rolled = parseFloat((Math.random() * 100).toFixed(2));
    const win = over ? rolled > target : rolled < target;

    let payout = 0;
    if (win) {
      payout = over
        ? parseFloat((bet * (100 / (100 - target))).toFixed(2))
        : parseFloat((bet * (100 / target)).toFixed(2));
    }

    user.coins = user.coins - bet + payout;
    await user.save();

    const game = new DiceGame({
      userId: req.user.id,
      bet,
      target,
      over,
      rolled,
      win,
      payout,
      playedAt: new Date(),
    });

    await game.save();

    res.json({
      rolled,
      win,
      payout,
      balance: user.coins,
    });
  } catch (err) {
    console.error("Dice Roll Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 💰 GET /api/dice/balance - Get user balance


// 📜 GET /api/dice/history - Last 10 plays
router.get("/history", userauth, async (req, res) => {
  try {
    const history = await DiceGame.find({ userId: req.user.id })
      .sort({ playedAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
