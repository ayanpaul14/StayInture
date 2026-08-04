const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true }, // optional now - keep for later if you add SMS back
    passwordHash: { type: String, select: false }, // only used if you add email/password login later

    // One account can be a customer AND a host.
    // isHost flips to true the first time the user lists a property.
    isHost: { type: Boolean, default: false },

    // Which mode the app should open in by default (frontend toggle state)
    activeRole: { type: String, enum: ["customer", "host"], default: "customer" },

    avatarUrl: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Only relevant if you ever add password-based login alongside OTP
userSchema.methods.comparePassword = async function (candidate) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
