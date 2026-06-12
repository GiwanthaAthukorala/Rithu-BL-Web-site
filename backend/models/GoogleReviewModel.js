const mongoose = require("mongoose");

const GoogleReviewSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["facebook", "GoogleReview"],
      default: "GoogleReview",
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
      default: "approved",
    },
    amount: {
      type: Number,
      default: 40.0,
    },
    submissionCount: {
      type: Number,
      default: 1,
    },
    reviewLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoogleLink",
    },
  },
  { timestamps: true }
);

// Add index for better performance
GoogleReviewSubmissionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model(
  "GoogleReviewSubmission",
  GoogleReviewSubmissionSchema
);
