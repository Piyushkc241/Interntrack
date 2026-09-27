require("dotenv").config();
require("./src/config/validateEnv")();

const app = require("./src/app");
const { checkAndSendDueReminders } = require("./src/services/reminder.service");
const { cleanupExpiredSessions } = require("./src/services/session.service");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Periodically checks for reminders whose time has arrived and emails them
// (only sends if BREVO_API_KEY is set — otherwise it just logs and moves on).
const CHECK_INTERVAL_MS = (parseInt(process.env.REMINDER_CHECK_INTERVAL_MINUTES, 10) || 5) * 60 * 1000;

setInterval(() => {
  checkAndSendDueReminders().catch((err) => console.error("Reminder check failed:", err.message));
}, CHECK_INTERVAL_MS);

// Periodically deletes expired session rows so the sessions table doesn't
// grow forever — every login/register creates one, and nothing else
// removes them. Once a day is plenty; this table grows slowly. Runs once
// shortly after startup too, so a freshly deployed server doesn't wait a
// full day for its first cleanup.
const SESSION_CLEANUP_INTERVAL_MS =
  (parseInt(process.env.SESSION_CLEANUP_INTERVAL_HOURS, 10) || 24) * 60 * 60 * 1000;

function runSessionCleanup() {
  cleanupExpiredSessions()
    .then((count) => {
      if (count > 0) console.log(`Session cleanup: removed ${count} expired session row(s).`);
    })
    .catch((err) => console.error("Session cleanup failed:", err.message));
}

setTimeout(runSessionCleanup, 60 * 1000); // once, shortly after boot
setInterval(runSessionCleanup, SESSION_CLEANUP_INTERVAL_MS);
