const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["withdrawal", "deposit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "success", "approved", "rejected", "completed"],
      default: "pending",
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    bankDetails: {
      name: String,
      branch: String,
      account: String,
    },
    // Amount from referral earnings included in this withdrawal (0 if none)
    referralBonus: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Transaction", transactionSchema);
