const { verifyToken } = require("../utils/jwt");

// Reads "Authorization: Bearer <token>", verifies it, attaches req.userId.
// Every route that should be scoped to "the logged-in user's own data" uses this.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or malformed authorization header" });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
