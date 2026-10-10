const express = require("express");
const router = express.Router();
const { getMe, postUsers, loginUser, logoutUser } = require("../controllers/userControllers");
const requireAuth = require("../middleware/auth");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiters");
const { verifyCsrf } = require("../middleware/csrf");

// login/register are intentionally NOT behind verifyCsrf: there's no
// authenticated session yet for an attacker to ride on, and requiring a
// pre-fetched token here just adds a race-condition risk (form submitted
// before the token cookie round-trip completes) for very little real
// protection. logout DOES need it — it acts on an existing session.
router.post("/", registerLimiter, postUsers);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", verifyCsrf, logoutUser);

// The only "read a user" route. Deliberately no GET /:id or GET / — those
// used to let any logged-in user look up anyone else's profile by id
// (an IDOR). req.userId comes from the verified auth cookie, so this can
// only ever return the caller's own data.
router.get("/me", requireAuth, getMe);

module.exports = router;
