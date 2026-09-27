const crypto = require("crypto");
const { cookieOptions } = require("../utils/jwt");

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Double-submit cookie pattern. The browser auto-attaches cookies to any
// request to our domain — even ones a malicious site tricks it into
// sending — so the auth cookie alone doesn't prove the request came from
// our own frontend. This token closes that gap: it's readable by JS (NOT
// httpOnly), so only code actually running on our origin can read it out
// of document.cookie and echo it back in a request header. A forged
// cross-site request has no way to know that value, even though its
// cookies ride along automatically.
function ensureCsrfCookie(req, res, next) {
  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE_NAME, token, { ...cookieOptions(), httpOnly: false });
    // Make it available to verifyCsrf() later in this same request/response
    // cycle too, in case a single request both sets and needs the token.
    req.cookies[CSRF_COOKIE_NAME] = token;
  }
  next();
}

// Applied per-route (not globally) to state-changing endpoints. GET/HEAD/
// OPTIONS never mutate anything, so they're exempt by definition — CSRF is
// only a risk for requests that change state.
function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    const err = new Error("Invalid or missing CSRF token");
    err.status = 403;
    return next(err);
  }
  next();
}

module.exports = { ensureCsrfCookie, verifyCsrf, CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
