const userService = require("../services/user.service");
const sessionService = require("../services/session.service");
const { signToken, verifyToken, COOKIE_NAME, cookieOptions } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");

// Used by the frontend on page load to ask "who am I?" using the httpOnly
// auth cookie, instead of trusting a copy of the user cached client-side.
// Intentionally the ONLY read route on this resource: users can only ever
// fetch their own profile (via req.userId from the auth cookie), never an
// arbitrary id — that's what was letting any logged-in user read anyone
// else's name/email/phone before.
const getMe = asyncHandler(async (req, res) => {
  const user = await userService.findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  res.status(200).json(user);
});

const postUsers = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "password must be at least 6 characters" });
  }

  let newUser;
  try {
    newUser = await userService.createUser({ name, email, phone, password });
  } catch (err) {
    // Translating the DB's duplicate-email constraint into a meaningful
    // message is domain-specific, so it stays local here rather than
    // moving into the generic error handler; everything else still falls
    // through to it.
    if (err.code === "23505") {
      return res.status(409).json({ message: "email already registered" });
    }
    throw err;
  }

  const sessionId = await sessionService.createSession(newUser.id);
  const token = signToken(newUser.id, sessionId);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.status(201).json({ user: newUser });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await userService.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  const passwordMatches = await userService.verifyPassword(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  const sessionId = await sessionService.createSession(user.id);
  const token = signToken(user.id, sessionId);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  // Best-effort revocation: if there's a valid token, revoke its session
  // server-side so it can't be reused even if it was copied/stolen. The
  // cookie gets cleared below regardless of whether this succeeds — logout
  // should never fail just because the token was already invalid/expired.
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const decoded = verifyToken(token);
      await sessionService.revokeSession(decoded.sessionId, decoded.userId);
    } catch (err) {
      // Token already invalid/expired/tampered — nothing valid to revoke.
    }
  }

  // Clearing options must match the ones the cookie was set with
  // (path/sameSite/secure) or the browser won't remove it.
  const { maxAge, ...clearOptions } = cookieOptions();
  res.clearCookie(COOKIE_NAME, clearOptions);
  res.status(200).json({ message: "logged out" });
});

module.exports = { getMe, postUsers, loginUser, logoutUser };
