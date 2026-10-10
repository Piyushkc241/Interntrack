const pool = require("../config/db");
const { sendReminderEmail } = require("./email.service");

// Same class of check as applications' resumeId ownership: an applicationId
// is just a number from the client, and without verifying it belongs to
// this user, a reminder could be linked to someone else's application —
// leaking its company/role through the `LEFT JOIN applications` in list().
async function assertApplicationOwnership(userId, applicationId) {
  const result = await pool.query("SELECT id FROM applications WHERE id = $1 AND user_id = $2", [
    applicationId,
    userId,
  ]);
  if (result.rowCount === 0) {
    const err = new Error("applicationId does not belong to this user");
    err.status = 400;
    throw err;
  }
}

async function list(userId, { upcomingOnly, page, limit } = {}) {
  const conditions = ["r.user_id = $1"];
  const params = [userId];

  if (upcomingOnly === "true" || upcomingOnly === true) {
    conditions.push("r.remind_at >= NOW()");
  }

  const whereClause = conditions.join(" AND ");

  // Same clamping as applications' list(): limit capped at 100, page/limit
  // always coerced to sane positive integers.
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM reminders r WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(safeLimit, offset);
  const dataResult = await pool.query(
    `SELECT r.*, a.company, a.role
     FROM reminders r
     LEFT JOIN applications a ON a.id = r.application_id
     WHERE ${whereClause}
     ORDER BY r.remind_at ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    data: dataResult.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

async function create(userId, { title, remindAt, notes, applicationId }) {
  if (applicationId) {
    await assertApplicationOwnership(userId, applicationId);
  }

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

  // application_id can legitimately be set to null (unlinking) — only
  // check ownership when it's actually pointing at an application.
  if (fields.application_id) {
    await assertApplicationOwnership(userId, fields.application_id);
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

// --- Background email notifications (optional, needs BREVO_API_KEY) ---

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
