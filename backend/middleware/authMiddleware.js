const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    }

    res.status(401);
    throw new Error("Not authorized, no token");
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message || "Not authorized" });
  }
};

const admin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superadmin")
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    });
  }
};

module.exports = { protect, admin };
