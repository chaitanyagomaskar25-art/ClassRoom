# BCA Student Success API

Backend-only V1 MVP for the BCA Student Success Platform. The API uses Node.js, Express, MongoDB/Mongoose, JWT bearer authentication, bcrypt password hashing, Zod request validation, and Helmet/CORS/rate limiting.

## Requirements and setup

- Node.js 20+
- MongoDB 6+ running locally or a MongoDB connection string

```sh
cd backend
cp .env.example .env
npm install
# Generate a private development JWT secret in .env
node -e "const fs=require('node:fs');const c=require('node:crypto');const p='.env';const s=fs.readFileSync(p,'utf8');if(!/^JWT_SECRET=(?!replace-with-).{32,}$/m.test(s)){fs.writeFileSync(p,s.replace(/^JWT_SECRET=.*$/m,'JWT_SECRET='+c.randomBytes(48).toString('base64url')),{mode:0o600});fs.chmodSync(p,0o600)}"
npm run seed
npm run dev
```

The API listens on `http://localhost:5000`. The command above generates a private random JWT secret for local development; keep `.env` private. If you change the secret later, users with previously issued tokens will need to sign in again. In production, provide a secret of at least 32 characters through your deployment's secret manager. `CORS_ORIGIN` accepts a comma-separated allowlist.

### Demo accounts (local seed)

| Role | Email | Password |
| --- | --- | --- |
| Mentor | `mentor@demo.local` | `Mentor123!` |
| Student | `student@demo.local` | `Student123!` |
| Student | `student2@demo.local` | `Student123!` |

The seed is repeatable, but it **replaces all curriculum documents** and clears lesson progress and quiz attempts for the two demo students before restoring the sample data. Run it only against a local development database. The sample curriculum covers Semesters 1 and 2; no official Semesters 3–6 syllabus was supplied. Both students are assigned to the demo mentor. Do not use these credentials outside local development.

## API conventions

The versioned API is under **`/api/v1`**. For frontend integration, stable unversioned aliases are also available under **`/api`**; these are the same handlers and authorization policies. Successful responses are wrapped in `{ "data": ... }`; errors use `{ "error": { "message": "...", "details": ... } }`. IDs are MongoDB ObjectIds. Authenticated routes require `Authorization: Bearer <token>`. Registration creates student accounts only; mentor roles and mentor assignments are managed by trusted provisioning (the seed supplies a local mentor and assignments).

### Frontend route contracts (`/api`)

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public, rate limited | Create a student; accepts `name`, `email`, `password`, optional `enrollmentNumber`, `semester` |
| `POST` | `/api/auth/login` | Public, rate limited | Accepts `{ "email": "...", "password": "..." }`; returns `{ "data": { "user", "token" } }` |
| `GET` | `/api/auth/me` | Any signed-in role | Current authenticated user |
| `GET` | `/api/dashboard/student` | Student | Summary metrics and recent activity |
| `GET` | `/api/semesters` | Any signed-in role | Curriculum semester list |
| `GET` | `/api/semesters/:id/subjects` | Any signed-in role | Subjects for semester `id` |
| `GET` | `/api/subjects/:id/topics` | Any signed-in role | Topics for subject `id` |
| `GET` | `/api/topics/:id/lessons` | Any signed-in role | Lessons including current student's progress status |
| `GET` | `/api/quizzes` | Any signed-in role | Quiz list with `id`, `lessonId`, `title`, `questionCount`, and topic/subject/semester summaries |
| `GET` | `/api/curriculum/lessons/:lessonId/quiz` | Any signed-in role | Questions/options only; answer keys are never returned |
| `POST` | `/api/quizzes/:id/submit` | Student | Submit `{ "answers": [1, 0] }`; `id` is the lesson ID exposed as quiz `id` and `lessonId` by `GET /api/quizzes` |
| `GET` | `/api/progress/me` | Student | Own lesson progress |
| `POST` | `/api/progress/lessons/:lessonId/complete` | Student | Mark a lesson completed; no request body required |
| `GET` | `/api/dashboard/mentor` | Mentor | Aggregate summary of assigned students' activity |
| `GET` | `/api/mentors/students` | Mentor | Assigned student summaries only |

For a one-step completion action use `POST /api/progress/lessons/:lessonId/complete` (no body required). To also track in-progress state, use `PUT /api/progress/lessons/:lessonId` with `{ "status": "in_progress" }` or `{ "status": "completed" }`. Quiz submissions return the persisted attempt (`score` from 0 to 100) and per-question correctness. As everywhere in the API, successful results are inside `data` (for example, lists use `{ "data": { "semesters": [...] } }`).

### Authentication and profile

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health` | Public | API and database readiness |
| `POST` | `/api/v1/auth/register` | Public, rate limited | Register a student (`name`, `email`, `password`; optional `enrollmentNumber`, `semester`) |
| `POST` | `/api/v1/auth/login` | Public, rate limited | Login with email/password; returns user and JWT |
| `GET` | `/api/v1/auth/me` | Any signed-in role | Current user |
| `GET` | `/api/v1/profiles/me` | Any signed-in role | Current profile |
| `PATCH` | `/api/v1/profiles/me` | Student | Update name, semester, program, or bio |

### Curriculum, lessons, progress, and quizzes

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/curriculum/semesters` | Any signed-in role | List curriculum semesters |
| `GET` | `/api/v1/curriculum/semesters/:semesterId/subjects` | Any signed-in role | Semester subjects |
| `GET` | `/api/v1/curriculum/subjects/:subjectId/topics` | Any signed-in role | Subject topics |
| `GET` | `/api/v1/curriculum/topics/:topicId/lessons` | Any signed-in role | Topic lessons and the signed-in student's progress |
| `GET` | `/api/v1/curriculum/lessons/:lessonId` | Any signed-in role | Lesson content (answer keys omitted) |
| `GET` | `/api/v1/curriculum/lessons/:lessonId/quiz` | Any signed-in role | Quiz questions/options without answer keys |
| `GET` | `/api/v1/progress/me` | Student | Own lesson progress |
| `PUT` | `/api/v1/progress/lessons/:lessonId` | Student | Set lesson status to `in_progress` or `completed` |
| `POST` | `/api/v1/quizzes/lessons/:lessonId/attempts` | Student | Submit `{ "answers": [0, 1] }`; returns score and per-question correctness |
| `GET` | `/api/v1/quizzes/me` | Student | Own quiz attempts |

### Dashboards and mentor monitoring

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/dashboard/student` | Student | Lesson completion and recent activity |
| `GET` | `/api/v1/dashboard/mentor` | Mentor | Aggregate activity for assigned students |
| `GET` | `/api/v1/mentor/students` | Mentor | Assigned student summaries |
| `GET` | `/api/v1/mentor/students/:studentId` | Mentor | Assigned student's profile, progress, and quiz attempts |

Mentor routes always scope queries by the authenticated mentor's `mentorId`. Looking up a student assigned to another mentor returns `404` and does not disclose that student's existence.

## Validation

```sh
npm test
```

`npm run seed` initializes two semesters, three subjects, four topics, five lessons with quizzes, and demo activity. Curriculum writes are intentionally not exposed in this MVP; add a separately authorized content-management workflow before production curriculum editing.
