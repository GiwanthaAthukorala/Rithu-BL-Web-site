const Instrgram = require("../models/InstrgramModel");
const Earnings = require("../models/Earnings");
const generateImageHash = require("../utils/generateImageHash");
const isSimilarHash = require("../utils/isSimilarHash");
const InstagramAccount = require("../models/instrgramAccount");
const User = require("../models/userModel");

// Controller functions
const createInstaSubmission = async (req, res) => {
  console.log("==== SUBMISSION REQUEST RECEIVED ====");
  console.log("User ID : ", req.user?._id);
  console.log("Uploaded file:", req.file);

  const startTime = Date.now();

  try {
    // Check if user has active Facebook accounts
    const user = await User.findById(req.user._id).populate(
      "InstagramAccounts",
    );

    const activeAccounts = user.instagramAccounts.filter((acc) => acc.isActive);

    if (activeAccounts.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "You need to add at least one active Instagram account before submitting tasks. Please add your Instagram account in your profile settings.",
        errorType: "NO_INSTAGRAM_ACCOUNT",
      });
    }

    // Get the selected Instagram account from request
    const { instagramAccountId } = req.body;

    let selectedAccount = null;

    if (instagramAccountId) {
      selectedAccount = activeAccounts.find(
        (acc) => acc._id.toString() === instagramAccountId,
      );

      if (!selectedAccount) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive Instagram account selected",
        });
      }
    } else {
      // If no account selected, use the most recently used or first active account
      selectedAccount = activeAccounts.sort((a, b) => {
        if (!a.lastUsed) return -1;
        if (!b.lastUsed) return 1;
        return b.lastUsed - a.lastUsed;
      })[0];
    }

    // Update account usage
    selectedAccount.lastUsed = new Date();
    selectedAccount.usageCount += 1;
    await selectedAccount.save();

    // Continue with existing submission logic...
    if (!req.file || !req.file.path) {
      console.error("❌ File upload failed. req.file is missing or invalid.");
      return res.status(400).json({
        success: false,
        message: "File upload failed. No file received from client.",
      });
    }

    const userId = req.user._id;
    const cloudinaryUrl = req.file.path;
    const { linkId } = req.body;

    // 1. Generate hash
    let uploadedImageHash;
    try {
      uploadedImageHash = await generateImageHash(cloudinaryUrl);
    } catch (hashError) {
      console.error("Hash generation failed:", hashError);
      return res.status(400).json({
        success: false,
        message: "Could not process image. Please try a different file.",
      });
    }

    // Check for duplicates with better error reporting
    const previousSubmissions = await Instrgram.find({
      user: userId,
      imageHash: { $ne: null },
    }).limit(10);

    for (const submission of previousSubmissions) {
      if (isSimilarHash(uploadedImageHash, submission.imageHash)) {
        return res.status(400).json({
          success: false,
          message: `This screenshot is too similar to one you submitted on ${new Date(
            submission.createdAt,
          ).toLocaleDateString()}. Please upload a different screenshot.`,
          errorType: "DUPLICATE_IMAGE",
          previousDate: new Date(submission.createdAt).toLocaleDateString(),
        });
      }
    }

    console.log("Hashing took", Date.now() - startTime, "ms");

    const submission = await Instrgram.create({
      user: req.user._id,
      platform: req.body.platform || "Instragrm",
      screenshot: cloudinaryUrl,
      imageHash: uploadedImageHash,
      status: "approved",
      amount: 1.0,
      instagramAccount: selectedAccount._id,
      instagramAccountName: selectedAccount.accountName,
    });

    let earnings = await Earnings.findOne({ user: req.user._id });
    if (!earnings) {
      earnings = await Earnings.create({
        user: req.user._id,
        totalEarned: 1.0,
        availableBalance: 1.0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else {
      earnings.totalEarned += 1.0;
      earnings.availableBalance += 1.0;
      await earnings.save();
    }

    if (req.body.linkId) {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://rithu-bl-web-site.vercel.app";
        await fetch(`${apiUrl}/api/links/${linkId}/submit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`,
            "Content-Type": "application/json",
          },
        });
      } catch (linkError) {
        console.error("Failed to mark link as submitted:", linkError);
      }
    }

    const io = req.app.get("io");
    io.to(req.user._id.toString()).emit("earningsUpdate", earnings);
    console.log("Updated earnings:", earnings);

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: {
        submission,
        instragrmAccount: {
          name: selectedAccount.accountName,
          url: selectedAccount.profileUrl,
        },
      },
      earnings,
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createInstaMultipleSubmissions = async (req, res) => {
  try {
    // Check if user has active Instagram accounts
    const user = await User.findById(req.user._id).populate(
      "instagramAccounts",
    );

    const activeAccounts = user.instagramAccounts.filter((acc) => acc.isActive);

    if (activeAccounts.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "You need to add at least one active Instagram account before submitting tasks. Please add your Instagram account in your profile settings.",
        errorType: "NO_INSTAGRAM_ACCOUNT",
      });
    }

    // Get the selected Instagram account from request
    const { instagramAccountId } = req.body;

    let selectedAccount = null;

    if (instagramAccountId) {
      selectedAccount = activeAccounts.find(
        (acc) => acc._id.toString() === instagramAccountId,
      );

      if (!selectedAccount) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive Instagram account selected",
        });
      }
    } else {
      selectedAccount = activeAccounts.sort((a, b) => {
        if (!a.lastUsed) return -1;
        if (!b.lastUsed) return 1;
        return b.lastUsed - a.lastUsed;
      })[0];
    }

    // Update account usage
    selectedAccount.lastUsed = new Date();
    selectedAccount.usageCount += 1;
    await selectedAccount.save();

    // Add your multiple submission logic here
    res.status(200).json({
      success: true,
      message: "Multiple submissions processed",
      data: {
        facebookAccount: {
          name: selectedAccount.accountName,
          url: selectedAccount.profileUrl,
        },
      },
    });
  } catch (error) {
    console.error("Multiple submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserInstaSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id }).populate(
      "instagramAccount",
      "accountName profileUrl",
    );
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user submissions",
      error: error.message,
    });
  }
};

const approveInstaSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    submission.status = "approved";
    await submission.save();

    let earnings = await Earnings.findOne({ user: submission.user });
    if (!earnings) {
      earnings = await Earnings.create({
        user: submission.user,
        totalEarned: submission.amount,
        availableBalance: submission.amount,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else {
      earnings.totalEarned += submission.amount;
      earnings.availableBalance += submission.amount;
      await earnings.save();
    }

    const io = req.app.get("io");
    io.to(submission.user.toString()).emit("earningsUpdate", {
      totalEarned: earnings.totalEarned,
      availableBalance: earnings.availableBalance,
      pendingWithdrawal: earnings.pendingWithdrawal,
      withdrawnAmount: earnings.withdrawnAmount,
    });

    res.json({
      success: true,
      message: "Submission approved and earnings updated",
      data: {
        submission,
        earnings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

const rejectInstaSubmission = async (req, res) => {
  try {
    const submission = await Instrgram.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    submission.status = "rejected";
    await submission.save();

    res.json({
      success: true,
      message: "Submission rejected",
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error("Rejection Error : ", error);
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};

module.exports.createInstaSubmission = createInstaSubmission;
module.exports.createInstaMultipleSubmissions = createInstaMultipleSubmissions;
module.exports.getUserInstaSubmissions = getUserInstaSubmissions;
module.exports.approveInstaSubmission = approveInstaSubmission;
module.exports.rejectInstaSubmission = rejectInstaSubmission;
