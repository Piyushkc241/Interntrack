// Wraps an async controller so a thrown error or a rejected promise is
// forwarded to Express's error-handling middleware via next(err),
// automatically. Without this, every controller needs its own try/catch
// just to avoid an unhandled promise rejection crashing the process.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
