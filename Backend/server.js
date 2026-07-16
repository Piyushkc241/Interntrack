require("dotenv").config();
const app = require("./src/app");
const { checkAndSendDueReminders } = require("./src/services/reminder.service");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Periodically checks for reminders whose time has arrived and emails them
// (only sends if RESEND_API_KEY is set — otherwise it just logs and moves on).
const CHECK_INTERVAL_MS = (parseInt(process.env.REMINDER_CHECK_INTERVAL_MINUTES, 10) || 5) * 60 * 1000;

setInterval(() => {
  checkAndSendDueReminders().catch((err) => console.error("Reminder check failed:", err.message));
}, CHECK_INTERVAL_MS);
