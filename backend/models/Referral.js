const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // A user can only be referred once globally
    },
    referrerName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    totalCommissionEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    commissionHistory: [
      {
        withdrawalAmount: { type: Number, required: true },
        commissionAmount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index: referrer's referrals list
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referee: 1 });

module.exports = mongoose.model("Referral", referralSchema);
