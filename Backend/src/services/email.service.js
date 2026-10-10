const { apiKey } = require("../config/email");

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
// Must be the exact address you verified as a "Sender" in Brevo's dashboard
// (Settings > Senders) — Brevo rejects sends from an unverified address,
// same idea as Resend's domain requirement but for one email instead of a
// whole domain.
const SENDER_EMAIL = process.env.REMINDER_FROM_EMAIL || "";
const SENDER_NAME = process.env.REMINDER_FROM_NAME || "InternTrack";

// `title` and `notes` are free-text fields a user typed into the reminder
// form — they go straight into an HTML email below, so without escaping,
// something like `<img src=x onerror=alert(1)>` as a note would execute as
// real markup for whoever reads the email. This turns it back into inert
// text before it's ever interpolated into the template.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Fully optional. If BREVO_API_KEY (or the sender address) isn't set, this
// just logs and returns — it never throws, so a missing key can't break
// reminder creation or the background checker.
async function sendReminderEmail({ to, title, remindAt, notes }) {
  if (!apiKey) {
    console.warn(`[email skipped, no BREVO_API_KEY] Would have reminded ${to} about "${title}"`);
    return { skipped: true };
  }
  if (!SENDER_EMAIL) {
    console.warn("[email skipped, no REMINDER_FROM_EMAIL] Brevo needs a verified sender address.");
    return { skipped: true };
  }

  const safeTitle = escapeHtml(title);
  const safeNotes = notes ? escapeHtml(notes) : "";

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject: `Reminder: ${title}`,
        htmlContent: `<p>This is a reminder for <strong>${safeTitle}</strong>, scheduled for ${new Date(
          remindAt
        ).toLocaleString()}.</p>${safeNotes ? `<p>${safeNotes}</p>` : ""}`,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Failed to send reminder email:", result.message || response.statusText);
      return { error: result.message || response.statusText };
    }

    return result; // { messageId: "..." }
  } catch (err) {
    console.error("Failed to send reminder email:", err.message);
    return { error: err.message };
  }
}

module.exports = { sendReminderEmail };
