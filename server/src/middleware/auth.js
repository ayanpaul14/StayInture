const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT and attaches the logged-in user to req.user
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Use on routes that only make sense for a host (e.g. creating a listing).
// Any customer can become a host by listing a property - this just checks
// they've actually done that at least once.
function requireHost(req, res, next) {
  if (!req.user.isHost) {
    return res.status(403).json({
      message: "Switch to host mode and list a property first",
    });
  }
  next();
}

module.exports = { protect, requireHost };
