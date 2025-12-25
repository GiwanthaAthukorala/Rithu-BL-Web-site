const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: [
        "youtube",
        "facebook",
        "instagram",
        "tiktok",
        "vimeo",
        "dailymotion",
        "custom", // Add this for direct video files
      ],
      default: "youtube",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    embedUrl: {
      type: String,
      required: true,
    },

    thumbnailUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in seconds
      required: true,
      default: 60,
    },
    rewardAmount: {
      type: Number,
      default: 0.5,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxViews: {
      type: Number,
      default: null, // null means unlimited
    },
    currentViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Video", videoSchema);
