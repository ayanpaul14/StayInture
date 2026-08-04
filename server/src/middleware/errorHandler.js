// Catches errors from async route handlers (via express-async-errors style
// try/catch, or thrown errors) and returns a consistent JSON shape.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    // Mongo duplicate key error (e.g. phone already registered)
    return res.status(409).json({ message: "Duplicate value", details: err.keyValue });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong on the server",
  });
}

module.exports = errorHandler;
