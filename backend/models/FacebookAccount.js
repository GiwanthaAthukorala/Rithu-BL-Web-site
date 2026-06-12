const mongoose = require("mongoose");

const facebookAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountName: {
    type: String,
    required: [true, "Account name is required"],
    trim: true,
    maxlength: [100, "Account name cannot exceed 100 characters"],
  },
  profileUrl: {
    type: String,
    required: [true, "Profile URL is required"],
    trim: true,
    validate: {
      validator: function (v) {
        // Basic Facebook URL validation
        return /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+/i.test(v);
      },
      message: "Please enter a valid Facebook profile URL",
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastUsed: {
    type: Date,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure user doesn't add more than 20 accounts
facebookAccountSchema.index({ user: 1 });
// Make sure the unique index is properly configured
facebookAccountSchema.index(
  { user: 1, profileUrl: 1 },
  { unique: true, sparse: true },
);

module.exports = mongoose.model("FacebookAccount", facebookAccountSchema);
