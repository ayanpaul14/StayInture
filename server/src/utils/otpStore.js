// Simple in-memory OTP store for development.
// In production: use Redis (so it survives restarts / works across
// multiple server instances) and a real SMS gateway (MSG91, Twilio, etc.)
// to actually deliver the code instead of just logging it.

const otps = new Map(); // phone -> { code, expiresAt }

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateOtp(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otps.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });

  // TODO: replace with a real SMS API call
  console.log(`[OTP] ${phone} -> ${code} (dev mode, not actually sent)`);

  return code;
}

function verifyOtp(phone, code) {
  const entry = otps.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otps.delete(phone);
    return false;
  }
  const isValid = entry.code === code;
  if (isValid) otps.delete(phone); // one-time use
  return isValid;
}

module.exports = { generateOtp, verifyOtp };
