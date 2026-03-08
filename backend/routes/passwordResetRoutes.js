// routes/passwordResetRoutes.js
const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  resetPassword,
  verifyResetToken,
} = require("../controllers/passwordResetController");

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", forgotPassword);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.put("/reset-password/:token", resetPassword);

// @route   GET /api/auth/verify-token/:token
// @desc    Verify reset token validity
// @access  Public
router.get("/verify-token/:token", verifyResetToken);

module.exports = router;
