const pool = require("../config/db");
const { APPLICATION_STATUSES } = require("../models/applicationStatus");

const VALID_SORT_COLUMNS = ["created_at", "date_applied", "company", "status"];

async function list(userId, { status, search, sortBy, order, page, limit }) {
  const conditions = ["a.user_id = $1"];
  const params = [userId];

  if (status) {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(a.company ILIKE $${params.length} OR a.role ILIKE $${params.length})`);
  }

  const safeSortBy = VALID_SORT_COLUMNS.includes(sortBy) ? sortBy : "created_at";
  const safeOrder = order && order.toLowerCase() === "asc" ? "ASC" : "DESC";
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const whereClause = conditions.join(" AND ");

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM applications a WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(safeLimit, offset);
  const dataResult = await pool.query(
    `SELECT a.*, r.label AS resume_label
     FROM applications a
     LEFT JOIN resumes r ON r.id = a.resume_id
     WHERE ${whereClause}
     ORDER BY a.${safeSortBy} ${safeOrder}
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

async function getById(userId, applicationId) {
  const result = await pool.query(
    `SELECT a.*, u.name AS applicant_name, u.email AS applicant_email, r.label AS resume_label
     FROM applications a
     INNER JOIN users u ON u.id = a.user_id
     LEFT JOIN resumes r ON r.id = a.resume_id
     WHERE a.id = $1 AND a.user_id = $2`,
    [applicationId, userId]
  );
  return result.rows[0] || null;
}

async function create(userId, { company, role, status, dateApplied, notes, resumeId }) {
  const safeStatus = APPLICATION_STATUSES.includes(status) ? status : "applied";

  const result = await pool.query(
    `INSERT INTO applications (user_id, company, role, status, date_applied, notes, resume_id)
     VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6, $7)
     RETURNING *`,
    [userId, company, role, safeStatus, dateApplied || null, notes || null, resumeId || null]
  );
  return result.rows[0];
}

async function update(userId, applicationId, fields) {
  const allowed = ["company", "role", "status", "date_applied", "notes", "resume_id"];
  const keys = Object.keys(fields).filter((k) => allowed.includes(k));

  if (keys.length === 0) {
    const err = new Error("No valid fields provided to update");
    err.status = 400;
    throw err;
  }

  if (fields.status && !APPLICATION_STATUSES.includes(fields.status)) {
    const err = new Error(`status must be one of: ${APPLICATION_STATUSES.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values = keys.map((key) => fields[key]);

  const result = await pool.query(
    `UPDATE applications SET ${setClause}
     WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2}
     RETURNING *`,
    [...values, applicationId, userId]
  );

  return result.rows[0] || null;
}

async function remove(userId, applicationId) {
  const result = await pool.query(
    "DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id",
    [applicationId, userId]
  );
  return result.rowCount > 0;
}

module.exports = { list, getById, create, update, remove };
