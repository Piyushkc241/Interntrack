# InternTrack — Internship & Placement Tracker

A full-stack web application to track internship and job applications, manage resumes, set deadline reminders, and visualize your placement progress from a single dashboard.

## Features

- 🔐 **Authentication** — JWT-based auth with bcrypt password hashing
- 📋 **Application Tracking** — Full CRUD with status pipeline (applied → interview → offer / rejected)
- 🔍 **Search & Filter** — Search by company/role, filter by status, sort, and paginate
- 📄 **Resume Management** — Upload, download, and link resumes to specific applications
- ⏰ **Reminders** — Track upcoming deadlines and interviews, with optional automated email notifications
- 📊 **Analytics Dashboard** — Visual breakdown of application status and activity over time
- 🔒 **Per-user data isolation** — Every request is scoped to the authenticated user

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Recharts, Axios
**Backend:** Node.js, Express.js, PostgreSQL
**Auth:** JWT, bcryptjs
**File Uploads:** Multer
**Email:** Resend API

## Project Structure
INTERNTRACK/
├── Backend/
│   ├── server.js
│   └── src/
│       ├── config/         # DB connection, Multer, Resend client
│       ├── controllers/    # Request/response handling
│       ├── services/       # Business logic and SQL queries
│       ├── middleware/     # Auth guard, request logger
│       ├── routes/         # API route definitions
│       ├── models/         # Shared constants
│       └── db/             # Schema and migration script
└── frontend/
└── src/
├── pages/          # Route-level views
├── components/     # Reusable UI components
├── hooks/          # Auth context and hook
└── services/       # API client
## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Register a new user |
| POST | `/users/login` | Log in, returns JWT |
| GET | `/users/:id` | Get user profile *(auth)* |
| GET | `/applications` | List applications — supports search, filter, sort, pagination *(auth)* |
| POST | `/applications` | Create an application *(auth)* |
| PUT | `/applications/:id` | Update an application *(auth)* |
| DELETE | `/applications/:id` | Delete an application *(auth)* |
| GET | `/resumes` | List resumes *(auth)* |
| POST | `/resumes` | Upload a resume *(auth)* |
| GET | `/resumes/:id/download` | Download a resume *(auth)* |
| GET | `/reminders` | List reminders *(auth)* |
| POST | `/reminders` | Create a reminder *(auth)* |
| GET | `/stats/overview` | Dashboard statistics *(auth)* |

All protected routes require `Authorization: Bearer <token>` and are scoped to the authenticated user.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Backend

```bash
cd Backend
cp .env.example .env    # configure your database credentials
npm install
npm run db:init         # applies the schema
npm run dev              # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # starts on http://localhost:5173
```

## Environment Variables

**Backend `.env`**

| Variable | Description |
|----------|-------------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `RESEND_API_KEY` | *(optional)* Enables email reminders via [Resend](https://resend.com) |

**Frontend `.env`**

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |

## License

This project is open source and available under the [MIT License](LICENSE).
