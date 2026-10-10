const multer = require("multer");

// Centralized error handler — the one place that decides how a thrown
// error becomes an HTTP response. Controllers just throw (or let an
// awaited call reject) instead of every one of them repeating
// try/catch { console.log(err); res.status(500)... }. Must be registered
// last in app.js, after every route.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Multer throws for file-upload problems (wrong type from our
  // fileFilter, or exceeding the 5MB limit) as an error passed to next() —
  // without handling it here, it used to fall through to Express's default
  // HTML error page instead of a JSON response like the rest of the API.
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 5MB)" : err.message;
    return res.status(400).json({ message });
  }

  // Services/controllers can throw an Error with a `.status` on it (e.g.
  // application.service.js's "status must be one of: ..." validation) to
  // ask for a specific status code + message; anything else is treated as
  // an unexpected server error and its details are kept out of the
  // response (only logged server-side above).
  const status = err.status || 500;
  const message = err.status ? err.message : "internal server error";
  res.status(status).json({ message });
}

module.exports = errorHandler;
