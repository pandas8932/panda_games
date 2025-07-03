const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true ,
    unique : true 
  },
  email: {
    type: String,
    required: true,
    unique: true,       
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true          
  },
  password: {
    type: String,
    required: true
  },
  coins: {
    type: Number,
    default: 1000         // new users start with 1000 coins
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
