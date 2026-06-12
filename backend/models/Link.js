const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["facebook", "tiktok", "instagram", "youtube", "whatsapp"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    earnings: {
      type: Number,
      default: 1.0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Link", linkSchema);
