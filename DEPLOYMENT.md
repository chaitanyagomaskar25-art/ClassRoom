# BCA Student Success Platform — Deployment & Production Guide

This guide details the steps required to deploy the **BCA Student Success Platform** into production across Docker containers, cloud Virtual Private Servers (VPS), and managed cloud platforms (e.g. AWS, Render, Railway, DigitalOcean, MongoDB Atlas).

---

## 1. System Architecture

```
                  ┌────────────────────────┐
                  │   End Users (HTTPS)    │
                  └───────────┬────────────┘
                              │
                    ┌─────────▼────────┐
                    │ Nginx / Cloudflare│  (SSL/TLS Termination, Gzip, Caching)
                    └────┬────────┬────┘
                         │        │
          Static Assets  │        │  /api/*, /socket.io/*
                         ▼        ▼
       ┌────────────────────┐   ┌───────────────────────────┐
       │ Frontend Container │   │ Backend Node.js Service   │
       │ (React 19 + Vite)  │   │ (Express 4.21 + Socket.IO)│
       └────────────────────┘   └───────┬─────────────┬─────┘
                                        │             │
                                        ▼             ▼
                           ┌─────────────────┐  ┌───────────────┐
                           │  MongoDB Atlas  │  │  Redis 7.2    │
                           │ (Data Store)    │  │ (Cache/Queues)│
                           └─────────────────┘  └───────────────┘
```

---

## 2. Production Environment Checklist

Create a `.env` file in the `backend/` directory configured with your production secrets:

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Backend HTTP listening port | `5000` |
| `MONGODB_URI` | MongoDB connection URI (e.g., MongoDB Atlas SRV) | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/bca_production?retryWrites=true&w=majority` |
| `JWT_SECRET` | Cryptographically secure secret (min 32 chars) | Run `openssl rand -base64 48` to generate |
| `JWT_EXPIRES_IN` | Token duration | `1d` |
| `CORS_ORIGIN` | Whitelist of allowed origins (comma-separated) | `https://classroom.example.edu` |
| `REDIS_URL` | Redis caching & BullMQ connection URI | `redis://default:<password>@redis-host:6379` |
| `GEMINI_API_KEY` | Server-side Gemini API key for AI features | Server-side only (never exposed to frontend) |
| `OPENAI_API_KEY` | Server-side OpenAI API key (optional fallback) | Server-side only |

---

## 3. Deployment Option A: Docker Compose (Recommended)

The repository provides a complete, production-ready `docker-compose.yml` including MongoDB, Redis, the Node.js backend, and the Nginx-served frontend.

### Step 1: Clone and Configure
```bash
git clone https://github.com/your-org/bca-student-success-platform.git
cd bca-student-success-platform

# Set your secrets
cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

### Step 2: Build and Launch Containers
```bash
# Build images and start all services in detached mode
docker compose up --build -d

# Check running status & healthchecks
docker compose ps
```

### Step 3: Run Seed Data (Optional for new setups)
```bash
docker compose exec backend npm run seed
```

### Step 4: Verify Deployment
- Frontend web application: `http://<your-server-ip>/`
- Backend API Health check: `http://<your-server-ip>/api/v1/health`

---

## 4. Deployment Option B: Standalone VPS (Ubuntu/Debian + PM2)

### Step 1: Install System Prerequisites
```bash
sudo apt update && sudo apt install -y nodejs npm nginx redis-server git
sudo npm install -g pm2
```

### Step 2: Build Frontend
```bash
cd frontend
npm ci
npm run build
# The optimized production build is located in `frontend/dist`
```

### Step 3: Start Backend with PM2 Process Manager
```bash
cd ../backend
npm ci --omit=dev
pm2 start server.js --name "bca-backend" -i max
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/bca-platform`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/bca-student-success-platform/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site and install SSL certificate via Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/bca-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

---

## 5. Security & Optimization Checklist

1. **Input Sanitization & MongoDB Injection Protection**:
   - `mongoSanitize` middleware automatically strips `$` and `.` operators from all incoming requests.
2. **CORS Restrictions**:
   - Verify `CORS_ORIGIN` is explicitly set to production domain(s) and does not permit wildcards (`*`).
3. **Rate Limiting**:
   - Authentication endpoint: 20 requests per 15 minutes.
   - AI endpoints: 50 requests per 15 minutes.
   - Code execution: 100 runs per 15 minutes.
   - Global API: 300 requests per 15 minutes.
4. **Code Execution Sandboxing**:
   - Untrusted JavaScript and Python user code runs in isolated `node:vm` context with removed `fs`, `net`, and `child_process` modules and strict 2500ms execution timeout limits.
5. **Database Indexing**:
   - All high-frequency queries (student ID, semester, subject code, submission status) have compound indexes enabled.

---

## 6. Continuous Integration & Delivery (CI/CD)

The GitHub Actions workflow at `.github/workflows/ci-cd.yml` automatically executes on all pull requests and pushes to `main`:
1. Launches ephemeral MongoDB 7 and Redis 7 test containers.
2. Runs the full Node.js automated test suite (`npm test --prefix backend`).
3. Validates the frontend Vite production build (`npm run build --prefix frontend`).
4. Verifies Docker image builds for both frontend and backend.
