const mongoose = require("mongoose");

const videoWatchSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    watchDuration: {
      type: Number, // in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ["watching", "completed", "abandoned"],
      default: "watching",
    },
    rewardGiven: {
      type: Boolean,
      default: false,
    },
    amountEarned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast query performance
videoWatchSessionSchema.index({ user: 1, video: 1 });

module.exports = mongoose.model("VideoWatchSession", videoWatchSessionSchema);
