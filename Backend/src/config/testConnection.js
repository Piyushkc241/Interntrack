// Quick standalone check that your .env credentials actually reach Postgres.
// Run with: node src/config/testConnection.js
require("dotenv").config();
const pool = require("./db");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Connection failed:", err.message);
  } else {
    console.log("Connected to PostgreSQL at:", res.rows[0].now);
  }
  pool.end();
});
