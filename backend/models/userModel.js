const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { platform } = require("os");
const FacebookAccount = require("./FacebookAccount");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    username: { type: String, unique: true, sparse: true },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    bankName: { type: String, required: true },
    bankBranch: { type: String, required: true },
    bankAccountNo: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    profilePicture: {
      url: {
        type: String,
        default: null,
      },
      public_id: {
        type: String,
        default: null,
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    clickedLinks: [
      {
        linkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Link",
          required: true,
        },
        platform: {
          type: String,
          required: true,
          enum: ["facebook", "tiktok", "instagram", "youtube", "whatsapp"],
        },
        clickCount: {
          type: Number,
          default: 0,
          min: 0,
        },
        clickedAt: {
          type: Date,
          default: Date.now,
        },
        maxClicks: {
          type: Number,
          default: 2,
        },
        lastClickedAt: {
          type: Date,
          default: Date.now,
        },
        submitted: {
          type: Boolean,
          default: false,
        },
        submittedAt: Date,
      },
    ],

    fbreviewclickedLinks: [
      {
        linkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Link",
          required: true,
        },
        platform: {
          type: String,
          required: true,
          enum: ["facebook", "tiktok", "instagram", "youtube", "whatsapp"],
        },
        clickCount: {
          type: Number,
          default: 0,
          max: 1,
        },
        clickedAt: {
          type: Date,
          default: Date.now,
        },
        maxClicks: {
          type: Number,
          default: 1,
        },
        lastClickedAt: {
          type: Date,
          default: Date.now,
        },
        submitted: {
          type: Boolean,
          default: false,
        },
        submittedAt: Date,
      },
    ],
    fbCommentsclickedLinks: [
      {
        linkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Link",
          required: true,
        },
        platform: {
          type: String,
          required: true,
          enum: ["facebook", "tiktok", "instagram", "youtube", "whatsapp"],
        },
        clickCount: {
          type: Number,
          default: 0,
          max: 1,
        },
        clickedAt: {
          type: Date,
          default: Date.now,
        },
        maxClicks: {
          type: Number,
          default: 1,
        },
        lastClickedAt: {
          type: Date,
          default: Date.now,
        },
        submitted: {
          type: Boolean,
          default: false,
        },
        submittedAt: Date,
      },
    ],

    facebookAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FacebookAccount",
      },
    ],

    instagramAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstagramAccount",
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },

  { timestamps: true },
);

// Add this method to check if user can add more accounts
userSchema.methods.canAddFacebookAccount = function () {
  return this.facebookAccounts && this.facebookAccounts.length < 20;
};

// Add method to get available accounts count
userSchema.methods.getAvailableFacebookAccountsCount = function () {
  return 20 - (this.facebookAccounts?.length || 0);
};

// Add this method to check if user can add more accounts
userSchema.methods.canAddInstagramAccount = function () {
  return this.instagramAccounts && this.instagramAccounts.length < 20;
};

// Add method to get available accounts count
userSchema.methods.getAvailableInstagramAccountsCount = function () {
  return 20 - (this.instagramAccounts?.length || 0);
};

// Admin-specific methods
userSchema.methods.isAdmin = function () {
  return this.role === "admin" || this.role === "superadmin";
};

userSchema.methods.isSuperAdmin = function () {
  return this.role === "superadmin";
};
// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.username) {
    this.username = this.email.split("@")[0];
  }

  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Method to get profile picture URL or default
userSchema.methods.getProfilePictureUrl = function () {
  if (this.profilePicture && this.profilePicture.url) {
    return this.profilePicture.url;
  }
  // Return a default avatar URL or initials-based avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    this.firstName + "+" + this.lastName,
  )}&background=3B82F6&color=ffffff&size=400`;
};

module.exports = mongoose.model("User", userSchema);
