import http from 'node:http';
import mongoose from 'mongoose';
import app from './src/app.js';
import env from './src/config/env.js';
import connectDatabase from './src/config/database.js';
import { initSocketServer } from './src/services/socketService.js';

async function start() {
  await connectDatabase();
  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  const server = httpServer.listen(env.PORT, () => console.log(`API & Real-time Server listening on port ${env.PORT}`));

  const shutdown = (signal) => {
    console.log(`${signal} received; shutting down`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  console.error('Failed to start API:', error.message);
  process.exit(1);
});

export default app;
