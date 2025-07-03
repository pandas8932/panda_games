const mongoose = require("mongoose");
const connectdatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
module.exports = connectdatabase;


// notes :
//    process.env = holds environment variables.
//   process.env.MONGO_URI = gets the MongoDB URL you stored in .env.