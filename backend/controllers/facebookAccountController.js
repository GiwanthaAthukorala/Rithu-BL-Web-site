const FacebookAccount = require("../models/FacebookAccount");
const User = require("../models/userModel");

// Add a new Facebook account
const addFacebookAccount = async (req, res) => {
  try {
    const { accountName, profileUrl } = req.body;
    const userId = req.user._id;

    // Check if user has reached the limit
    const user = await User.findById(userId);

    if (user.facebookAccounts && user.facebookAccounts.length >= 20) {
      return res.status(400).json({
        success: false,
        message: "You have reached the maximum limit of 20 Facebook accounts",
      });
    }

    // Check if account with same URL already exists for this user
    const existingAccount = await FacebookAccount.findOne({
      user: userId,
      profileUrl: profileUrl,
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "This Facebook account is already added",
      });
    }

    // Create new Facebook account
    const facebookAccount = await FacebookAccount.create({
      user: userId,
      accountName,
      profileUrl,
    });

    // Add reference to user
    user.facebookAccounts.push(facebookAccount._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Facebook account added successfully",
      data: facebookAccount,
      remainingSlots: 20 - user.facebookAccounts.length,
    });
  } catch (error) {
    console.error("Add Facebook account error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This Facebook account URL is already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to add Facebook account",
    });
  }
};

// Get all Facebook accounts for a user
const getUserFacebookAccounts = async (req, res) => {
  try {
    const accounts = await FacebookAccount.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: accounts,
      total: accounts.length,
      remainingSlots: 20 - accounts.length,
      limit: 20,
    });
  } catch (error) {
    console.error("Get accounts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Facebook accounts",
    });
  }
};

// Update Facebook account
const updateFacebookAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { accountName, profileUrl, isActive } = req.body;

    const account = await FacebookAccount.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Facebook account not found",
      });
    }

    // Check if updating to a URL that already exists
    if (profileUrl && profileUrl !== account.profileUrl) {
      const existingAccount = await FacebookAccount.findOne({
        user: req.user._id,
        profileUrl: profileUrl,
        _id: { $ne: accountId },
      });

      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: "Another account with this URL already exists",
        });
      }
    }

    // Update fields
    if (accountName) account.accountName = accountName;
    if (profileUrl) account.profileUrl = profileUrl;
    if (isActive !== undefined) account.isActive = isActive;

    await account.save();

    res.json({
      success: true,
      message: "Account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Update account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update Facebook account",
    });
  }
};

// Delete Facebook account
const deleteFacebookAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await FacebookAccount.findOneAndDelete({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Facebook account not found",
      });
    }

    // Remove reference from user
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { facebookAccounts: accountId },
    });

    res.json({
      success: true,
      message: "Facebook account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete Facebook account",
    });
  }
};

// Toggle account active status
const toggleAccountStatus = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await FacebookAccount.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Facebook account not found",
      });
    }

    account.isActive = !account.isActive;
    await account.save();

    res.json({
      success: true,
      message: `Account ${account.isActive ? "activated" : "deactivated"} successfully`,
      data: account,
    });
  } catch (error) {
    console.error("Toggle account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle account status",
    });
  }
};

// Verify Facebook account (admin function)
const verifyFacebookAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    // Check if user is admin
    if (!req.user.isAdmin || !req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        message: "Only admins can verify accounts",
      });
    }

    const account = await FacebookAccount.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Facebook account not found",
      });
    }

    account.isVerified = true;
    await account.save();

    res.json({
      success: true,
      message: "Account verified successfully",
      data: account,
    });
  } catch (error) {
    console.error("Verify account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify account",
    });
  }
};

// Get account usage statistics
const getAccountUsage = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await FacebookAccount.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Facebook account not found",
      });
    }

    res.json({
      success: true,
      data: {
        usageCount: account.usageCount,
        lastUsed: account.lastUsed,
        isActive: account.isActive,
        isVerified: account.isVerified,
      },
    });
  } catch (error) {
    console.error("Get usage error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get account usage",
    });
  }
};

module.exports = {
  addFacebookAccount,
  getUserFacebookAccounts,
  updateFacebookAccount,
  deleteFacebookAccount,
  toggleAccountStatus,
  verifyFacebookAccount,
  getAccountUsage,
};
