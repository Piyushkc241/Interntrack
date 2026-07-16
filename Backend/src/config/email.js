// Optional: only activates if RESEND_API_KEY is set in .env.
// Sign up free at https://resend.com, grab an API key, and paste it in .env
// as RESEND_API_KEY. Without it, this stays null and reminder emails are
// silently skipped (logged, not crashed) — the rest of the app is unaffected.
const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

if (!apiKey) {
  console.warn("RESEND_API_KEY not set — reminder emails are disabled (app still works fine).");
}

module.exports = resend;
