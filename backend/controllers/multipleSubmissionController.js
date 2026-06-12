const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const generateImageHash = require("../utils/generateImageHash");
const isSimilarHash = require("../utils/isSimilarHash");

const createMultipleSubmissions = async (req, res) => {
  console.log("==== MULTIPLE SUBMISSIONS REQUEST RECEIVED ====");
  console.log("User ID:", req.user?._id);
  console.log("Number of files:", req.files?.length);

  try {
    const userId = req.user._id;
    const files = req.files;
    const { linkId, platform = "facebook" } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 screenshots allowed per submission",
      });
    }

    // Get user's previous submissions for duplicate checking
    const previousSubmissions = await Submission.find({
      user: userId,
      imageHash: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const successfulSubmissions = [];
    const duplicateImages = [];
    const failedImages = [];

    // Process each file
    for (const file of files) {
      try {
        const cloudinaryUrl = file.path;

        // Generate hash for the uploaded image
        const uploadedImageHash = await generateImageHash(cloudinaryUrl);

        // Check for duplicates in previous submissions
        let isDuplicate = false;
        for (const submission of previousSubmissions) {
          if (isSimilarHash(uploadedImageHash, submission.imageHash)) {
            isDuplicate = true;
            duplicateImages.push({
              filename: file.originalname,
              reason: `Duplicate of submission from ${new Date(submission.createdAt).toLocaleDateString()}`,
            });
            break;
          }
        }

        // Check for duplicates in current batch
        if (!isDuplicate) {
          for (const successfulSub of successfulSubmissions) {
            if (isSimilarHash(uploadedImageHash, successfulSub.imageHash)) {
              isDuplicate = true;
              duplicateImages.push({
                filename: file.originalname,
                reason: "Duplicate within current batch",
              });
              break;
            }
          }
        }

        if (!isDuplicate) {
          // Create submission
          const submission = await Submission.create({
            user: userId,
            platform: platform,
            screenshot: cloudinaryUrl,
            imageHash: uploadedImageHash,
            status: "approved",
            amount: 1.0,
          });

          successfulSubmissions.push(submission);
          previousSubmissions.push(submission); // Add to check for subsequent duplicates
        }
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        failedImages.push({
          filename: file.originalname,
          reason: error.message,
        });
      }
    }

    // Update earnings based on successful submissions
    let totalEarned = successfulSubmissions.length * 1.0;

    if (successfulSubmissions.length > 0) {
      let earnings = await Earnings.findOne({ user: userId });
      if (!earnings) {
        earnings = await Earnings.create({
          user: userId,
          totalEarned: totalEarned,
          availableBalance: totalEarned,
          pendingWithdrawal: 0,
          withdrawnAmount: 0,
        });
      } else {
        earnings.totalEarned += totalEarned;
        earnings.availableBalance += totalEarned;
        await earnings.save();
      }

      // Emit update to the user
      const io = req.app.get("io");
      io.to(userId.toString()).emit("earningsUpdate", earnings);
    }

    // Mark link as submitted if we have one
    if (linkId) {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await fetch(`${apiUrl}/api/links/${linkId}/submit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${req.headers.authorization?.split(" ")[1]}`,
            "Content-Type": "application/json",
          },
        });
      } catch (linkError) {
        console.error("Failed to mark link as submitted:", linkError);
      }
    }

    res.status(201).json({
      success: true,
      message: `Processed ${files.length} images`,
      data: {
        successful: successfulSubmissions.length,
        duplicates: duplicateImages.length,
        failed: failedImages.length,
        details: {
          successful: successfulSubmissions.map((s) => ({
            id: s._id,
            amount: s.amount,
          })),
          duplicates: duplicateImages,
          failed: failedImages,
        },
        totalEarned: totalEarned,
      },
    });
  } catch (error) {
    console.error("Multiple submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createMultipleSubmissions,
};
