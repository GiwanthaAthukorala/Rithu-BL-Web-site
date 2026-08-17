const mongoose = require("mongoose");

const referralNotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["referral_invite", "referral_accepted", "referral_rejected", "referral_commission"],
      default: "referral_invite",
    },
    meta: {
      type: mongoose.Schema.Types.Mixed, // for extra data like commission amount
      default: {},
    },
  },
  { timestamps: true }
);

referralNotificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model("ReferralNotification", referralNotificationSchema);
