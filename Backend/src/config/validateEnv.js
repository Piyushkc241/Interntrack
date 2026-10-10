// Fails fast with a clear message if a required env var is missing, instead
// of the app booting "successfully" and then breaking confusingly on first
// use — e.g. jwt.sign() throwing deep inside a login request because
// JWT_SECRET was undefined, or every resume upload failing because
// Cloudinary was never configured. Called once, before the app starts.
//
// BREVO_API_KEY is deliberately NOT here — email.service.js already
// handles its absence gracefully (logs a warning, skips sending), so it's
// a real optional feature rather than a startup requirement.
const REQUIRED_VARS = [
  "JWT_SECRET",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("Missing required environment variable(s):");
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error("\nCheck Backend/.env against Backend/.env.example and fill these in, then restart.");
    process.exit(1);
  }
}

module.exports = validateEnv;
