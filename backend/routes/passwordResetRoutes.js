const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP,
} = require("../controllers/passwordResetController");

// Forgot password - Send OTP
router.post("/forgot-password", forgotPassword);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Resend OTP
router.post("/resend-otp", resendOTP);

// Reset password with token
router.put("/reset-password/:token", resetPassword);

// Keep old routes for backward compatibility if needed
router.get("/verify-token/:token", (req, res) => {
  res.json({
    success: true,
    message: "Token verification not required for OTP flow",
  });
});

router.put("/reset-password/:token", resetPassword);

module.exports = router;
