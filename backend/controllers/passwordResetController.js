const crypto = require("crypto");
const User = require("../models/userModel");
const { sendPasswordResetEmail } = require("../utils/emailService");

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Check rate limiting (max 3 attempts per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (
      user.resetPasswordLastAttempt &&
      user.resetPasswordLastAttempt > oneHourAgo &&
      user.resetPasswordAttempts >= 3
    ) {
      return res.status(429).json({
        success: false,
        message: "Too many reset attempts. Please try again after 1 hour.",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    user.resetPasswordOTP = {
      code: otp,
      expiresAt: otpExpiry,
    };
    user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
    user.resetPasswordLastAttempt = new Date();
    await user.save();

    // Send email
    await sendPasswordResetEmail(user.email, otp);

    res.status(200).json({
      success: true,
      message: "Password reset OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reset email. Please try again.",
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP exists and is valid
    if (
      !user.resetPasswordOTP ||
      !user.resetPasswordOTP.code ||
      !user.resetPasswordOTP.expiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: "No OTP request found. Please request a new one.",
      });
    }

    // Check if OTP has expired
    if (new Date() > user.resetPasswordOTP.expiresAt) {
      // Clear expired OTP
      user.resetPasswordOTP = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.resetPasswordOTP.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Generate verification token for password reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    user.resetPasswordOTP = undefined; // Clear OTP after successful verification
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken: resetToken, // Send the unhashed token
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new password",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the token from params
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new OTP.",
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordAttempts = 0; // Reset attempts on successful password change
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Check rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (
      user.resetPasswordLastAttempt &&
      user.resetPasswordLastAttempt > oneHourAgo &&
      user.resetPasswordAttempts >= 3
    ) {
      return res.status(429).json({
        success: false,
        message: "Too many reset attempts. Please try again after 1 hour.",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOTP = {
      code: otp,
      expiresAt: otpExpiry,
    };
    user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
    user.resetPasswordLastAttempt = new Date();
    await user.save();

    // Send new OTP
    await sendPasswordResetEmail(user.email, otp);

    res.status(200).json({
      success: true,
      message: "New OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

module.exports = {
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP,
};
