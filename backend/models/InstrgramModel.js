const mongoose = require("mongoose");

const InstrgramSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["facebook", "instagram", "youtube", "tiktok"], // Added "instagram" to enum
      default: "instagram",
    },
    screenshot: {
      type: String,
      required: true,
    },
    imageHash: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    amount: {
      type: Number,
      default: 1.0,
    },
    submissionCount: {
      type: Number,
      default: 1,
    },
    instagramAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstagramAccount",
    },
    instagramAccountName: {
      type: String,
    },
  },
  { timestamps: true },
);

// Add index for better query performance
InstrgramSubmissionSchema.index({ user: 1, createdAt: -1 });
InstrgramSubmissionSchema.index({ imageHash: 1 });

module.exports = mongoose.model(
  "InstrgramSubmission",
  InstrgramSubmissionSchema,
);
