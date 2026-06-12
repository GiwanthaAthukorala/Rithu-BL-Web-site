const mongoose = require("mongoose");

const fbReviewSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["facebook", "instagram", "tiktok", "youtube", "whatsapp"],
      default: "fbreview",
    },
    screenshot: {
      type: String,
      required: true,
    },
    imageHash: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Auto-approve for now
    },
    amount: {
      type: Number,
      default: 30.0, // Rs 30 for FB reviews
    },
    submissionCount: {
      type: Number,
      default: 1,
    },
    // Optional: Link to the review link that was clicked
    reviewLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReviewLink",
    },
  },
  { timestamps: true }
);

// Add index for better performance
fbReviewSubmissionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("FbReviewSubmission", fbReviewSubmissionSchema);
