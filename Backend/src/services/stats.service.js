const pool = require("../config/db");

async function getOverview(userId) {
  const countsResult = await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM applications
     WHERE user_id = $1
     GROUP BY status`,
    [userId]
  );

  const counts = { applied: 0, interview: 0, offer: 0, rejected: 0 };
  countsResult.rows.forEach((row) => {
    counts[row.status] = row.count;
  });

  const totalResult = await pool.query(
    "SELECT COUNT(*)::int AS total FROM applications WHERE user_id = $1",
    [userId]
  );

  const upcomingResult = await pool.query(
    `SELECT COUNT(*)::int AS count FROM reminders
     WHERE user_id = $1 AND remind_at >= NOW() AND remind_at <= NOW() + INTERVAL '7 days'`,
    [userId]
  );

  const timelineResult = await pool.query(
    `SELECT date_applied::date AS date, COUNT(*)::int AS count
     FROM applications
     WHERE user_id = $1
     GROUP BY date_applied
     ORDER BY date_applied ASC`,
    [userId]
  );

  return {
    total: totalResult.rows[0].total,
    byStatus: counts,
    upcomingReminders: upcomingResult.rows[0].count,
    timeline: timelineResult.rows,
  };
}

module.exports = { getOverview };
