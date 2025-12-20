// controllers/submissionController.js
const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const generateImageHash = require("../utils/generateImageHash");
const isSimilarHash = require("../utils/isSimilarHash");

// =============== BATCH UPLOAD FUNCTION ===============
const createSubmission = async (req, res) => {
  console.log("==== BATCH SUBMISSION REQUEST RECEIVED ====");
  console.log("User ID : ", req.user?._id);
  console.log("Uploaded files:", req.files);

  const startTime = Date.now();

  try {
    if (!req.files || req.files.length === 0) {
      console.error("❌ No files uploaded.");
      return res.status(400).json({
        success: false,
        message: "No files received. Please upload screenshots.",
      });
    }

    if (req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: "Maximum 6 screenshots allowed per submission.",
      });
    }

    const userId = req.user._id;
    const { linkId } = req.body;
    const results = [];
    const rejectedImages = [];

    // Process each image
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`Processing file ${i + 1}/${req.files.length}`);

      const cloudinaryUrl = file.path;

      // 1. Generate hash for each image
      let uploadedImageHash;
      try {
        uploadedImageHash = await generateImageHash(cloudinaryUrl);
      } catch (hashError) {
        console.error(`Hash generation failed for file ${i + 1}:`, hashError);
        rejectedImages.push({
          index: i + 1,
          reason: "Could not process image. Please try a different file.",
        });
        continue;
      }

      // 2. Check for duplicates
      const previousSubmissions = await Submission.find({
        user: userId,
        imageHash: { $ne: null },
      }).limit(20);

      let isDuplicate = false;
      for (const submission of previousSubmissions) {
        if (isSimilarHash(uploadedImageHash, submission.imageHash)) {
          rejectedImages.push({
            index: i + 1,
            reason: `Similar to submission on ${new Date(
              submission.createdAt
            ).toLocaleDateString()}`,
            previousDate: new Date(submission.createdAt).toLocaleDateString(),
          });
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) {
        continue;
      }

      // 3. Create submission record
      const submission = await Submission.create({
        user: userId,
        platform: req.body.platform || "facebook",
        screenshot: cloudinaryUrl,
        imageHash: uploadedImageHash,
        status: "approved",
        amount: 1.0,
      });

      results.push(submission);
    }

    // 4. Calculate total earnings
    const successfulCount = results.length;
    if (successfulCount > 0) {
      const totalEarnings = successfulCount * 1.0;

      let earnings = await Earnings.findOne({ user: userId });
      if (!earnings) {
        earnings = await Earnings.create({
          user: userId,
          totalEarned: totalEarnings,
          availableBalance: totalEarnings,
          pendingWithdrawal: 0,
          withdrawnAmount: 0,
        });
      } else {
        earnings.totalEarned += totalEarnings;
        earnings.availableBalance += totalEarnings;
        await earnings.save();
      }

      // Emit update to the user
      const io = req.app.get("io");
      io.to(userId.toString()).emit("earningsUpdate", earnings);
    }

    // 5. Mark link as submitted if provided
    if (linkId) {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://rithu-bl-web-side.vercel.app";
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

    console.log("Batch processing took", Date.now() - startTime, "ms");

    res.status(201).json({
      success: true,
      message: `Successfully processed ${successfulCount} screenshots${
        rejectedImages.length > 0 ? `, rejected ${rejectedImages.length}` : ""
      }`,
      data: {
        successful: results,
        rejected: rejectedImages,
        totalEarned: successfulCount * 1.0,
      },
    });
  } catch (error) {
    console.error("Batch submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =============== GET USER SUBMISSIONS FUNCTION ===============
const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user submissions",
      error: error.message,
    });
  }
};

// =============== APPROVE SUBMISSION FUNCTION ===============
const approveSubmission = async (req, res) => {
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

    // Update earnings
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

    // Emit update to the user
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

// =============== REJECT SUBMISSION FUNCTION ===============
const rejectSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
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

// =============== EXPORT ALL FUNCTIONS ===============
module.exports = {
  createSubmission,
  getUserSubmissions,
  approveSubmission,
  rejectSubmission,
};
