const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { generateOtp, verifyOtp } = require("../utils/otpStore");
const { sendOtpEmail } = require("../utils/sendEmail");

// POST /api/auth/send-otp   { email }
async function sendOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const code = generateOtp(email.toLowerCase().trim());

  try {
    await sendOtpEmail(email, code);
  } catch (err) {
    console.warn(`Could not email OTP to ${email}: ${err.message}`);
  }

  res.json({ message: "OTP sent" });
}

// POST /api/auth/verify-otp   { email, code, name? }
async function verifyOtpAndLogin(req, res) {
  const { email, code, name } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isValid = verifyOtp(normalizedEmail, code);
  if (!isValid) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({ email: normalizedEmail, name });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isHost: user.isHost,
      activeRole: user.activeRole,
    },
  });
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json({ user: req.user });
}

// PATCH /api/auth/me   { name?, phone? }
// Email is intentionally never editable here - it's the login identifier,
// so changing it would need its own re-verification flow, not a plain edit.
async function updateMe(req, res) {
  const { name, phone } = req.body;

  if (name !== undefined) req.user.name = name.trim();
  if (phone !== undefined) req.user.phone = phone.trim();

  await req.user.save();
  res.json({ user: req.user });
}

// PATCH /api/auth/switch-role   { role: "customer" | "host" }
async function switchRole(req, res) {
  const { role } = req.body;
  if (!["customer", "host"].includes(role)) {
    return res.status(400).json({ message: "Role must be 'customer' or 'host'" });
  }
  if (role === "host" && !req.user.isHost) {
    return res.status(403).json({ message: "List a property first to unlock host mode" });
  }

  req.user.activeRole = role;
  await req.user.save();
  res.json({ activeRole: req.user.activeRole });
}

module.exports = { sendOtp, verifyOtpAndLogin, getMe, updateMe, switchRole };