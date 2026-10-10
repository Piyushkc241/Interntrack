const { verifyToken, COOKIE_NAME } = require("../utils/jwt");
const sessionService = require("../services/session.service");
const asyncHandler = require("../utils/asyncHandler");

// Reads the token from the httpOnly "token" cookie, verifies it, and
// attaches req.userId + req.sessionId. Every route scoped to "the logged-in
// user's own data" uses this. Falls back to "Authorization: Bearer <token>"
// for non-browser API clients (e.g. Postman) that can't hold cookies.
const requireAuth = asyncHandler(async function requireAuth(req, res, next) {
  let token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    const header = req.headers.authorization || "";
    const [scheme, headerToken] = header.split(" ");
    if (scheme === "Bearer" && headerToken) token = headerToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Missing or expired session" });
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // The JWT being cryptographically valid only proves WE issued it and it
  // hasn't hit its own expiry — it says nothing about whether the session
  // was revoked since (logout, or a future "sign out all devices"). This
  // is the check that actually makes revocation work.
  const active = await sessionService.isSessionActive(decoded.sessionId);
  if (!active) {
    return res.status(401).json({ message: "Session has been revoked" });
  }

  req.userId = decoded.userId;
  req.sessionId = decoded.sessionId;
  next();
});

module.exports = requireAuth;
