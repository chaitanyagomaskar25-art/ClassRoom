import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBackendPort() {
  if (process.env.BACKEND_PORT) return Number(process.env.BACKEND_PORT);
  try {
    const backendEnvPath = path.resolve(__dirname, '../backend/.env');
    if (fs.existsSync(backendEnvPath)) {
      const content = fs.readFileSync(backendEnvPath, 'utf8');
      const match = content.match(/^PORT=(\d+)/m);
      if (match) return Number(match[1]);
    }
  } catch (e) {}
  return 5002;
}

const backendPort = getBackendPort();

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
      '/socket.io': {
        target: `http://localhost:${backendPort}`,
        ws: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 4200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/data/assessmentData')) {
            return 'assessment-data';
          }
          if (id.includes('/src/data/')) {
            return 'syllabus-data';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
