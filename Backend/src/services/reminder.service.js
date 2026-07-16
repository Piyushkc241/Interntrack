const pool = require("../config/db");
const { sendReminderEmail } = require("./email.service");

async function list(userId, { upcomingOnly } = {}) {
  const conditions = ["r.user_id = $1"];
  const params = [userId];

  if (upcomingOnly === "true" || upcomingOnly === true) {
    conditions.push("r.remind_at >= NOW()");
  }

  const result = await pool.query(
    `SELECT r.*, a.company, a.role
     FROM reminders r
     LEFT JOIN applications a ON a.id = r.application_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY r.remind_at ASC`,
    params
  );
  return result.rows;
}

async function create(userId, { title, remindAt, notes, applicationId }) {
  const result = await pool.query(
    `INSERT INTO reminders (user_id, application_id, title, remind_at, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, applicationId || null, title, remindAt, notes || null]
  );
  return result.rows[0];
}

async function update(userId, reminderId, fields) {
  const allowed = ["title", "remind_at", "notes", "application_id"];
  const keys = Object.keys(fields).filter((k) => allowed.includes(k));

  if (keys.length === 0) {
    const err = new Error("No valid fields provided to update");
    err.status = 400;
    throw err;
  }

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values = keys.map((key) => fields[key]);

  const result = await pool.query(
    `UPDATE reminders SET ${setClause}
     WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2}
     RETURNING *`,
    [...values, reminderId, userId]
  );
  return result.rows[0] || null;
}

async function remove(userId, reminderId) {
  const result = await pool.query(
    "DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING id",
    [reminderId, userId]
  );
  return result.rowCount > 0;
}

// --- Background email notifications (optional, needs RESEND_API_KEY) ---

async function findDueUnnotified() {
  const result = await pool.query(
    `SELECT r.*, u.email AS user_email
     FROM reminders r
     JOIN users u ON u.id = r.user_id
     WHERE r.notified = false AND r.remind_at <= NOW()`
  );
  return result.rows;
}

async function markNotified(reminderId) {
  await pool.query("UPDATE reminders SET notified = true WHERE id = $1", [reminderId]);
}

// Called on an interval from server.js. Finds reminders whose time has
// come and haven't been emailed yet, sends one email each, then marks them
// notified so they're never sent twice.
async function checkAndSendDueReminders() {
  const due = await findDueUnnotified();
  for (const reminder of due) {
    await sendReminderEmail({
      to: reminder.user_email,
      title: reminder.title,
      remindAt: reminder.remind_at,
      notes: reminder.notes,
    });
    await markNotified(reminder.id);
  }
  return due.length;
}

module.exports = { list, create, update, remove, checkAndSendDueReminders };
