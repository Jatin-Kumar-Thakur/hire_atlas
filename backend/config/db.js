const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGO_URI from environment.
 * Exits the process on initial connection failure so the problem is immediately visible.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB] Initial connection failed: ${err.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[DB] MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[DB] Runtime error: ${err.message}`);
});

module.exports = connectDB;
