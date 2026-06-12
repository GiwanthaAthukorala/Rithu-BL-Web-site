const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const adminAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, no token",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and ensure they are admin
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.isAdmin()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account deactivated",
        });
      }

      req.user = user;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

const superAdminAuth = async (req, res, next) => {
  try {
    await adminAuth(req, res, () => {
      if (req.user.isSuperAdmin()) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Super admin privileges required.",
        });
      }
    });
  } catch (error) {
    console.error("Super admin auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

module.exports = { adminAuth, superAdminAuth };
