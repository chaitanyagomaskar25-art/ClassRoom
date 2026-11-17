const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/database');

async function start() {
  await connectDatabase();
  const server = app.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));

  const shutdown = (signal) => {
    console.log(`${signal} received; shutting down`);
    server.close(async () => {
      await require('mongoose').disconnect();
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
