const { admin } = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNo,
      password,
    } = req.body;
    console.log("Registration attempt with:", req.body);
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "bankName",
      "bankBranch",
      "bankAccountNo",
      "password",
    ];
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        errorType: "email",
        message: "Email is already registered",
      });
    }
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        errorType: "phone",
        message: "Phone number is already registered",
      });
    }

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists", field: "email" });
    }

    const accountExists = await User.findOne({ bankAccountNo });
    if (accountExists) {
      return res.status(400).json({
        message: "Bank account number already Registered",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNo,
      password,
    });
    console.log("User created successfully:", user);

    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bankName: user.bankName,
        bankBranch: user.bankBranch,
        bankAccountNo: user.bankAccountNo,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate key errors
    return res.status(500).json({
      success: false,
      message: "Registration failed due to server error",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      bankName: user.bankName,
      bankBranch: user.bankBranch,
      bankAccountNo: user.bankAccountNo,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

// Get user profile (protected)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNo,
      currentPassword,
      newPassword,
    } = req.body;

    // Find the user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          errorType: "email",
          message: "Email is already registered",
        });
      }
    }

    // Check if phone number is being changed and if it's already taken
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const phoneExists = await User.findOne({
        phoneNumber,
        _id: { $ne: userId },
      });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          errorType: "phone",
          message: "Phone number is already registered",
        });
      }
    }

    // Check if bank account is being changed and if it's already taken
    if (bankAccountNo && bankAccountNo !== user.bankAccountNo) {
      const accountExists = await User.findOne({
        bankAccountNo,
        _id: { $ne: userId },
      });
      if (accountExists) {
        return res.status(400).json({
          success: false,
          errorType: "bankAccount",
          message: "Bank account number is already registered",
        });
      }
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          errorType: "password",
          message: "Current password is required to set new password",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.matchPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          errorType: "currentPassword",
          message: "Current password is incorrect",
        });
      }

      // Update password (will be hashed by the pre-save middleware)
      user.password = newPassword;
    }

    // Update other fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bankName) user.bankName = bankName;
    if (bankBranch) user.bankBranch = bankBranch;
    if (bankAccountNo) user.bankAccountNo = bankAccountNo;

    await user.save();

    // Return updated user data (without password)
    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || "Validation error",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture && user.profilePicture.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      } catch (deleteError) {
        console.error("Error deleting old profile picture:", deleteError);
        // Continue even if deletion fails
      }
    }

    // Update user with new profile picture
    user.profilePicture = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading profile picture",
    });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for email and password
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
      });
    }

    // Check if user exists and is admin
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if user has admin privileges
    if (!["admin", "superadmin"].includes(user.role)) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      message: "Admin login failed. Please try again.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  adminLogin,
  updateUserProfile,
  uploadProfilePicture,
};
