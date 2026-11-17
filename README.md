# BCA Student Success Platform

A semester-based learning platform for BCA students and mentors, with administrator curriculum tools planned for a later phase. The current V1 scope covers authentication, curriculum, lessons, quizzes, progress tracking, student learning dashboards, and mentor student monitoring. AI, resume tools, career planning, and gamification are intentionally left for later phases in the project specification.

The demo seed contains sample content for Semesters 1 and 2. The specification does not provide an official syllabus for Semesters 3–6, so those subjects and lessons have not been invented. Curriculum editing and the Admin Dashboard are deferred from this read-only V1.

## Technology

- Frontend: React, Vite, Redux Toolkit, React Router, JavaScript
- Backend: Node.js, Express, MongoDB, Mongoose, JavaScript
- Authentication: JWT and bcrypt password hashing

## Run locally

Prerequisites: Node.js 20 or newer and MongoDB running locally (or a MongoDB connection string).

1. Start the API from a terminal:

   ```sh
   cd backend
   npm install
   cp .env.example .env
   # Set a private JWT_SECRET and the MongoDB URI in .env.
   npm run seed
   npm run dev
   ```

2. Start the frontend in another terminal:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

3. Open the Vite URL printed in the frontend terminal. The Vite development server proxies `/api` requests to `http://localhost:5000`.

See [backend/README.md](./backend/README.md) for API routes, seed accounts, environment variables, and backend-specific setup.

## Verify

```sh
cd frontend && npm run build && npm audit
cd ../backend && npm test && npm audit
```

## Project structure

```text
frontend/  React application
backend/   Express API and MongoDB models
```
