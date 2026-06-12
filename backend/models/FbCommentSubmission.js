const mongoose = require("mongoose");

const fbCommentSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: [
        "facebook",
        "instagram",
        "tiktok",
        "youtube",
        "whatsapp",
        "comments",
      ],
      default: "comments",
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
      default: 15.0,
    },
    submissionCount: {
      type: Number,
      default: 1,
    },
    reviewLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommentsLink",
    },
  },
  { timestamps: true }
);

// Add index for better performance
fbCommentSubmissionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model(
  "FbCommentSubmission",
  fbCommentSubmissionSchema
);
