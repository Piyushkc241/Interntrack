const crypto = require("crypto");
const pool = require("../config/db");

// Mirrors JWT_EXPIRES_IN's simple "<number>d" format so a session row
// expires at the same time the JWT itself would — keeping this in sync
// with utils/jwt.js's cookieMaxAgeMs() rather than hardcoding a duration.
function sessionExpiryDate() {
  const raw = process.env.JWT_EXPIRES_IN || "7d";
  const match = /^(\d+)d$/.exec(raw);
  const days = match ? parseInt(match[1], 10) : 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// Called on every login/register. Returns the new session's id, which gets
// embedded in the JWT as `sessionId` — that's the value requireAuth checks
// against this table on every request.
async function createSession(userId) {
  const id = crypto.randomUUID();
  const expiresAt = sessionExpiryDate();
  await pool.query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)", [
    id,
    userId,
    expiresAt,
  ]);
  return id;
}

// A session only counts as active if it exists, hasn't been revoked, and
// hasn't passed its own expiry — the JWT's `exp` claim already rejects
// expired tokens on its own, but checking expires_at here too means a
// session can be inspected/cleaned up independent of the JWT verifying.
async function isSessionActive(sessionId) {
  if (!sessionId) return false;
  const result = await pool.query(
    "SELECT id FROM sessions WHERE id = $1 AND revoked_at IS NULL AND expires_at > NOW()",
    [sessionId]
  );
  return result.rowCount > 0;
}

// Scoped to userId too, so a session id can never be used to revoke a
// DIFFERENT user's session even if guessed/leaked.
async function revokeSession(sessionId, userId) {
  if (!sessionId) return;
  await pool.query(
    "UPDATE sessions SET revoked_at = NOW() WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL",
    [sessionId, userId]
  );
}

// Every login/register inserts a session row, and nothing else ever
// deletes one — without this, the table grows forever. Deletes rows past
// their own expiry (whether or not they were ever revoked), so a session
// row lives here for at most JWT_EXPIRES_IN. Revoked-but-not-yet-expired
// rows are deliberately kept a little longer, in case they're ever needed
// to answer "was this session revoked, and when." Called on a timer from
// server.js, the same pattern as the reminder-email background check.
async function cleanupExpiredSessions() {
  const result = await pool.query("DELETE FROM sessions WHERE expires_at < NOW()");
  return result.rowCount;
}

module.exports = { createSession, isSessionActive, revokeSession, cleanupExpiredSessions };
