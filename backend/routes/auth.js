const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userauth = require("../middlewares/user");

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Check for duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email, username, or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword, // store hashed
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // login with either email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(200).json({ token, user: { id: user._id, username: user.username, coins: user.coins } });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

router.get('/me', userauth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username coins');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
