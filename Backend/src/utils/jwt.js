const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";

function signToken(userId, sessionId) {
  return jwt.sign({ userId, sessionId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Same "how long is a token valid" value, expressed in ms for res.cookie's
// maxAge. Only supports the simple "<number>d" style used by JWT_EXPIRES_IN
// here (e.g. "7d"); falls back to 7 days for anything else.
function cookieMaxAgeMs() {
  const raw = process.env.JWT_EXPIRES_IN || "7d";
  const match = /^(\d+)d$/.exec(raw);
  const days = match ? parseInt(match[1], 10) : 7;
  return days * 24 * 60 * 60 * 1000;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
    maxAge: cookieMaxAgeMs(),
  };
}

module.exports = { signToken, verifyToken, COOKIE_NAME, cookieOptions };
