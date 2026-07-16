const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const SALT_ROUNDS = 10;

async function createUser({ name, email, phone, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, created_at`,
    [name, email, phone, hashedPassword]
  );

  return result.rows[0];
}

async function findAllUsers() {
  const result = await pool.query(
    "SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC"
  );
  return result.rows;
}

async function findUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, phone, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

async function findUserByEmail(email) {
  // Includes the password hash — only for internal login verification,
  // never send this object out in an API response.
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { createUser, findAllUsers, findUserById, findUserByEmail, verifyPassword };
