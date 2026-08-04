const express = require("express");
const { protect } = require("../middleware/auth");
const { sendOtp, verifyOtpAndLogin, getMe, updateMe, switchRole } = require("../controllers/authController");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndLogin);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/switch-role", protect, switchRole);

module.exports = router;