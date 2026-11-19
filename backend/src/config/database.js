import mongoose from 'mongoose';
import env from './env.js';

async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

export default connectDatabase;
