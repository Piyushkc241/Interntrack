const fs = require("fs");
const pool = require("../config/db");

async function list(userId) {
  const result = await pool.query(
    "SELECT * FROM resumes WHERE user_id = $1 ORDER BY uploaded_at DESC",
    [userId]
  );
  return result.rows;
}

async function getById(userId, resumeId) {
  const result = await pool.query(
    "SELECT * FROM resumes WHERE id = $1 AND user_id = $2",
    [resumeId, userId]
  );
  return result.rows[0] || null;
}

async function create(userId, { label, originalName, storedPath }) {
  const result = await pool.query(
    `INSERT INTO resumes (user_id, label, original_name, stored_path)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, label, originalName, storedPath]
  );
  return result.rows[0];
}

async function remove(userId, resumeId) {
  const resume = await getById(userId, resumeId);
  if (!resume) return false;

  await pool.query("DELETE FROM resumes WHERE id = $1 AND user_id = $2", [resumeId, userId]);
  fs.unlink(resume.stored_path, () => {}); // best-effort disk cleanup
  return true;
}

module.exports = { list, getById, create, remove };
