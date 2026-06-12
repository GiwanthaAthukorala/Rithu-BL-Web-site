const TiktokSubmission = require("../models/TiktokModel");
const Earnings = require("../models/Earnings");
const generateImageHash = require("../utils/generateImageHash");
const isSimilarHash = require("../utils/isSimilarHash");

//const path = require("path");
//const fs = require("fs").promises;
//const { v4: uuidv4 } = require("uuid");
//const multer = require("multer");

// Configure storage
/*const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadDir = path.join(__dirname, "../public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});*/

const fileFilter = (req, file, cb) => {
  const validTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG/JPG/PNG images allowed"), false);
  }
};

// Create multer instance
/*const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});*/

// Controller functions
const createTiktokSubmission = async (req, res) => {
  console.log("==== SUBMISSION REQUEST RECEIVED ====");
  console.log("User ID : ", req.user?._id);
  console.log("Uploaded file:", req.file);

  const startTime = Date.now();

  try {
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
    const previousSubmissions = await TiktokSubmission.find({
      user: userId,
      imageHash: { $ne: null },
    }).limit(10); // Limit to recent submissions

    for (const submission of previousSubmissions) {
      if (isSimilarHash(uploadedImageHash, submission.imageHash)) {
        return res.status(400).json({
          success: false,
          message: `This screenshot is too similar to one you submitted on ${new Date(
            submission.createdAt
          ).toLocaleDateString()}. Please upload a different screenshot.`,
          errorType: "DUPLICATE_IMAGE",
          previousDate: new Date(submission.createdAt).toLocaleDateString(),
        });
      }
    }

    console.log("Hashing took", Date.now() - startTime, "ms");

    // Validate required fields
    if (!req.user?._id) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    /*const fileData = {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    };*/

    const submission = await TiktokSubmission.create({
      user: req.user._id,
      platform: req.body.platform || "facebook",
      screenshot: cloudinaryUrl,
      imageHash: uploadedImageHash,
      status: "approved",
      amount: 1.0,
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
        // Don't fail the submission if link tracking fails
      }
    }
    // Update earnings (only when admin approves)
    // We'll move this to the approveSubmission function

    // Emit update to the user
    const io = req.app.get("io");
    io.to(req.user._id.toString()).emit("earningsUpdate", earnings);
    console.log("Updated earnings:", earnings);

    // Debug logging

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: submission,
      earnings,
    });
  } catch (error) {
    console.error("Submission error:", error);

    /* if (req.file) {
      try {
        await fs.unlink(
          path.join(__dirname, "../public/uploads", req.file.filename)
        );
      } catch (cleanupError) {
        console.error("Failed to clean up file:", cleanupError);
      }
    }*/

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserTiktokSubmissions = async (req, res) => {
  try {
    const submissions = await TiktokSubmission.find({ user: req.user._id });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user submissions",
      error: error.message,
    });
  }
};

const approveTitokSubmission = async (req, res) => {
  try {
    const submission = await TiktokSubmission.findById(req.params.id);
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

const rejectTiktokSubmission = async (req, res) => {
  try {
    const submission = await TiktokSubmission.findById(req.params.id);
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
        earnings,
      },
    });
  } catch (error) {
    console.error("Approval Error : ", error);
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};

// Export as separate named exports
//module.exports.uploadFile = upload.single("screenshot");
module.exports.createTiktokSubmission = createTiktokSubmission;
module.exports.getUserTiktokSubmissions = getUserTiktokSubmissions;
module.exports.approveTitokSubmission = approveTitokSubmission;
module.exports.rejectTiktokSubmission = rejectTiktokSubmission;
