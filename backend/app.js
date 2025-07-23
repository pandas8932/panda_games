const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectdatabase = require("./config/database");


dotenv.config();
connectdatabase();

const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/auth", require("./routes/auth")); 
// app.use("/api/dice", require("./routes/diceGame/diceroute"));
app.get("/", (req, res) => {
  res.send(" API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
