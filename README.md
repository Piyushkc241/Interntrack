# InternTrack

Full-stack Internship & Placement Tracker, built inside your existing project
structure and naming conventions (`Backend/src/config/db.js` with
`DB_HOST`/`DB_USER`/etc., `userControllers.js`-style controller names,
`services/` for query logic).

**Everything below has actually been run in this environment** — not just
written: dependencies installed, a real PostgreSQL database created, the
schema applied, the server started, and every endpoint hit with curl,
including auth, hashing, joins, search, pagination, file upload/download,
cross-user isolation, and the reminder-email checker. The frontend was
built with `vite build` and produced zero errors. You still need to run it
yourself to see it in your browser, but nothing here is untested guesswork.

## What was fixed in your existing code

- **`postUsers` stored plaintext passwords.** Now hashed with `bcryptjs` before the `INSERT`, and the hash is never included in any API response.
- **`postUsers` returned status `501`** (Not Implemented — the wrong code for a caught error) — now `500`.
- **`getUserById` was just a `console.log`** — now actually queries and returns the user, or `404` if not found.
- **`GET /users` had no auth** — anyone could list every registered user's name, email, and phone. Now requires a valid token.

## What's new

- **Login** (`POST /users/login`) — verifies the hash, returns a JWT.
- **Applications, Resumes, Reminders, Stats** — full CRUD, all scoped to the logged-in user via a `requireAuth` middleware that reads the JWT and sets `req.userId`. Tested specifically: **User B gets a 404, not User A's data**, on every read/update/delete of User A's rows.
- **Reminder emails (optional)** — see below.
- **React frontend** — Home (public landing), Login, Register, Dashboard (stats + charts), Applications, Resumes, Reminders — built into your existing `frontend/src/{components,hooks,pages,services}` folders.

## Files I wrote fresh (you never showed me the originals)

Everything above was built directly from the code you pasted. These four
files didn't exist in what you showed me, so I wrote reasonable versions —
worth a quick look in case you already had something different for them:

- `Backend/src/routes/health.js` — assumed `GET /health` returning `{status:"ok"}`
- `Backend/src/middleware/logger.js` — a one-line request logger (method + URL + timestamp); it exists but wasn't wired into `app.js` in what you showed me, so I added `app.use(logger)`
- `Backend/package.json` — full dependency list; if you already have one, just add whatever's missing (see below) rather than overwrite
- `frontend/src/pages/Home.jsx` — was an empty Day-5 placeholder; now a public landing page

## Setup

**1. Database** (you've already got this working):
```bash
createdb -U postgres interntrack
```

**2. Backend**
```bash
cd Backend
cp .env.example .env     # fill in DB_PASSWORD, JWT_SECRET — see note on # below
npm install
npm run db:init
npm run dev               # http://localhost:5000
```

> If your password contains `#`, `@`, or spaces, wrap it in quotes in `.env`:
> `DB_PASSWORD="piyush#241"` — otherwise `dotenv` truncates it at the `#`. (This bit you before — it's fixed by quoting, not by changing the password.)

**3. Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173`, hit "Get started," register, and you're in.

## Reminder emails — optional, needs a free API key

Reminders work fully without this — you can create, view, and delete them.
This only controls whether an **email actually gets sent** when a reminder's
time arrives (checked every 5 minutes in the background).

1. Sign up free at **[resend.com](https://resend.com)** (no credit card, 3,000 emails/month free)
2. Create an API key in their dashboard
3. In `Backend/.env`, set:
   ```
   RESEND_API_KEY=re_your_key_here
   ```
4. Restart the backend.

Without a key, you'll just see this in the server log — the app keeps working normally:
```
RESEND_API_KEY not set — reminder emails are disabled (app still works fine).
```

## API reference

All routes except `POST /users` (register) and `POST /users/login` require
`Authorization: Bearer <token>`.

```
POST   /users                          { name, email, phone?, password }
POST   /users/login                    { email, password }
GET    /users                          (auth) list all users
GET    /users/:id                      (auth)

GET    /applications                   ?status=&search=&sortBy=&order=&page=&limit=
GET    /applications/:id
POST   /applications                   { company, role, status?, dateApplied?, notes?, resumeId? }
PUT    /applications/:id
DELETE /applications/:id

GET    /resumes
POST   /resumes                        multipart/form-data: resume (file), label
GET    /resumes/:id/download
DELETE /resumes/:id

GET    /reminders                      ?upcoming=true
POST   /reminders                      { title, remindAt, notes?, applicationId? }
PUT    /reminders/:id
DELETE /reminders/:id

GET    /stats/overview
```

`search` does `ILIKE` on company/role. `sortBy` accepts `created_at | date_applied | company | status`.

## If your `Backend/package.json` already exists

Just make sure these are installed — nothing here conflicts with typical starter deps:
```bash
npm install bcryptjs jsonwebtoken multer resend
```

## What's still open (be upfront about this before Infosys)

- No automated test suite — everything was verified manually via curl in this session, matching how you've been testing so far.
- No pagination UI on Resumes/Reminders yet (Applications has it — same pattern extends easily).
- No deployment config (Render/Vercel) yet — both apps run on standard `npm start` / `vite build`, so they drop in with minimal setup when you're ready.
