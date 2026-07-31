 const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is not defined. Make sure backend/.env or backend/agents/.env contains a valid MongoDB connection string."
      );
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;