const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const logger = require("./middleware/logger");

const health = require("./routes/health");
const users = require("./routes/userRoutes");
const applications = require("./routes/applicationRoutes");
const resumes = require("./routes/resumeRoutes");
const reminders = require("./routes/reminderRoutes");
const stats = require("./routes/statsRoutes");

const app = express();

// Needed for express-rate-limit (and req.ip generally) to see the real
// client IP instead of the reverse proxy's IP when deployed behind one
// (Render, Railway, Heroku, etc. all sit behind a proxy). Harmless locally.
app.set("trust proxy", 1);

// Sets a standard set of security-related response headers (X-Content-Type-
// Options: nosniff, X-Frame-Options: DENY, Strict-Transport-Security, etc.)
// with sane defaults — this is a JSON API, not a page-serving app, so
// helmet's default CSP/COOP settings don't need any custom tuning here.
app.use(helmet());

// The auth token now travels as an httpOnly cookie, so the frontend origin
// must be named explicitly (a wildcard "*" origin can't receive cookies)
// and credentials must be allowed both here and on the client's requests.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("InternTrack API running");
});

app.use(cookieParser());
const { ensureCsrfCookie } = require("./middleware/csrf");
// Issues the csrfToken cookie on any request that doesn't already have one
// (e.g. the frontend's first GET /users/me on page load) — so by the time
// the user does anything that mutates data, the token is already in place.
app.use(ensureCsrfCookie);


const { verifyCsrf } = require("./middleware/csrf");

app.use("/", health);
app.use("/users", users);
// verifyCsrf only actually checks non-GET requests (see middleware/csrf.js),
// so mounting it here protects every POST/PUT/DELETE under these routers
// without needing to touch each individual route.
app.use("/applications", verifyCsrf, applications);
app.use("/resumes", verifyCsrf, resumes);
app.use("/reminders", verifyCsrf, reminders);
app.use("/stats", stats);

app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});

app.use(require("./middleware/errorHandler"));

module.exports = app;
