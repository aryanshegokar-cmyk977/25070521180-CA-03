const mongoose = require('mongoose');

// Connects to MongoDB. Called once when the server starts (and by the seed script).
async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookverse';
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('Could not connect to MongoDB. Is MongoDB running?');
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
