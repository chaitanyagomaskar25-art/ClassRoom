const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDatabase;
