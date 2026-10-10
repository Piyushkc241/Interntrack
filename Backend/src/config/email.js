// Optional: only activates if BREVO_API_KEY is set in .env.
// Sign up free at https://www.brevo.com, verify a single sender email
// under Senders (no custom domain needed — unlike Resend's free tier),
// then grab an API key from SMTP & API > API Keys. Without it, this stays
// null and reminder emails are silently skipped (logged, not crashed) —
// the rest of the app is unaffected.
const apiKey = process.env.BREVO_API_KEY || null;

if (!apiKey) {
  console.warn("BREVO_API_KEY not set — reminder emails are disabled (app still works fine).");
}

module.exports = { apiKey };
