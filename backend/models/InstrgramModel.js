const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
      enum: ["facebook", "Instrgram"],
      default: "Instrgram",
    },
    screenshot: {
      type: String,
      required: true,
    },
    imageHash: { type: String },
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
    //lastSubmissionTime: {
    //type: Date,
    //default: Date.now,
  },

  { timestamps: true },
);

//submissionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model(
  "InstrgramSubmission",
  InstrgramSubmissionSchema,
);
