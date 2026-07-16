const resend = require("../config/email");

const FROM_EMAIL = process.env.REMINDER_FROM_EMAIL || "InternTrack <onboarding@resend.dev>";

// Fully optional. If RESEND_API_KEY isn't set, this just logs and returns —
// it never throws, so a missing key can't break reminder creation or the
// background checker.
async function sendReminderEmail({ to, title, remindAt, notes }) {
  if (!resend) {
    console.warn(`[email skipped, no RESEND_API_KEY] Would have reminded ${to} about "${title}"`);
    return { skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Reminder: ${title}`,
      html: `<p>This is a reminder for <strong>${title}</strong>, scheduled for ${new Date(
        remindAt
      ).toLocaleString()}.</p>${notes ? `<p>${notes}</p>` : ""}`,
    });
    return result;
  } catch (err) {
    console.error("Failed to send reminder email:", err.message);
    return { error: err.message };
  }
}

module.exports = { sendReminderEmail };
