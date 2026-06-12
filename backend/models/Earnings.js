const mongoose = require("mongoose");

const earningsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingWithdrawal: {
      type: Number,
      default: 0,
      min: 0,
    },
    withdrawnAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better performance
earningsSchema.index({ user: 1 });

module.exports = mongoose.model("Earnings", earningsSchema);
