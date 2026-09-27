const rateLimit = require("express-rate-limit");

// Login is the classic brute-force target — cap attempts per IP instead of
// letting a script try unlimited password guesses against one account.
// Keyed by IP (the default), so it also slows down credential-stuffing
// sweeps across many accounts from the same source.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true, // adds RateLimit-* response headers
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in a few minutes." },
});

// Registration doesn't need brute-force protection in the same sense, but
// an unthrottled signup endpoint is an easy way to spam the DB or hammer
// bcrypt (which is intentionally slow/CPU-heavy) — a looser cap is enough.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many accounts created from this IP. Please try again later." },
});

module.exports = { loginLimiter, registerLimiter };
