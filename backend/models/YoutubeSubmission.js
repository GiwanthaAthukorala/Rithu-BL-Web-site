const mongoose = require("mongoose");

const youtubeSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    screenshot: {
      type: String,
      required: true,
    },
    imageHash: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    amount: {
      type: Number,
      default: 2.0, // Rs. 2 per submission
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YoutubeSubmission", youtubeSubmissionSchema);
