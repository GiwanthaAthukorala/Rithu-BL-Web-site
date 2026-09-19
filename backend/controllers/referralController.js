const User = require("../models/userModel");
const Referral = require("../models/Referral");
const ReferralNotification = require("../models/ReferralNotification");
const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/referrals/send
// Logged-in user sends a referral invite using a name + email
// ─────────────────────────────────────────────────────────────────────────────
exports.sendReferralRequest = async (req, res) => {
  try {
    const { name, email } = req.body;
    const senderId = req.user._id;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide both the name and email of the person to add",
      });
    }

    // 1) Find the target user by email
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message:
          "No member found with that email. They must be registered on our site.",
      });
    }

    // 2) Cannot refer yourself
    if (targetUser._id.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as a referral.",
      });
    }

    // 3) If target is admin, requester must also be admin
    if (
      (targetUser.role === "admin" || targetUser.role === "superadmin") &&
      req.user.role === "user"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts can only be added as referrals by another admin.",
      });
    }

    // 4) Check if target user is already someone's referral (globally unique)
    const existingReferral = await Referral.findOne({
      referee: targetUser._id,
    });
    if (existingReferral) {
      if (existingReferral.status === "accepted") {
        return res.status(400).json({
          success: false,
          message:
            "This user is already part of another member's referral network.",
        });
      }
      if (existingReferral.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "A referral request for this user is already pending.",
        });
      }
      // If previously rejected, allow re-invitation from same referrer only
      if (
        existingReferral.status === "rejected" &&
        existingReferral.referrer.toString() !== senderId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This user has already declined a referral invitation. They cannot be added.",
        });
      }
    }

    // 5) Check referrer hasn't exceeded 20 referrals
    const acceptedCount = await Referral.countDocuments({
      referrer: senderId,
      status: "accepted",
    });
    if (acceptedCount >= 20) {
      return res.status(400).json({
        success: false,
        message: "You have reached the maximum limit of 20 referrals.",
      });
    }

    // 6) Check no duplicate pending request from same referrer to same referee
    const duplicatePending = await Referral.findOne({
      referrer: senderId,
      referee: targetUser._id,
      status: "pending",
    });
    if (duplicatePending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending referral request for this user.",
      });
    }

    // 7) Create referral
    const referral = await Referral.create({
      referrer: senderId,
      referee: targetUser._id,
      referrerName: name,
      status: "pending",
    });

    // 8) Create notification for target user
    const senderName = `${req.user.firstName} ${req.user.lastName}`;
    const notification = await ReferralNotification.create({
      recipient: targetUser._id,
      sender: senderId,
      referral: referral._id,
      type: "referral_invite",
      message: `${senderName} has invited you to join their referral network. Accept to confirm.`,
    });

    // 9) Emit real-time notification via socket
    const io = req.app.get("io");
    if (io) {
      io.to(targetUser._id.toString()).emit("referralNotification", {
        type: "referral_invite",
        notification,
        from: senderName,
      });
    }

    res.status(201).json({
      success: true,
      message: `Referral invitation sent to ${targetUser.firstName} ${targetUser.lastName}. Waiting for their acceptance.`,
      referral,
    });
  } catch (error) {
    console.error("sendReferralRequest error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/referrals/:id/respond
// Target user accepts or rejects a referral invite
// ─────────────────────────────────────────────────────────────────────────────
exports.respondToReferral = async (req, res) => {
  try {
    const { action } = req.body; // "accept" | "reject"
    const userId = req.user._id;
    const referralId = req.params.id;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'accept' or 'reject'",
      });
    }

    const referral = await Referral.findById(referralId).populate("referrer");
    if (!referral) {
      return res
        .status(404)
        .json({ success: false, message: "Referral not found" });
    }

    // Only the referee (target) can respond
    if (referral.referee.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to respond to this referral",
      });
    }

    if (referral.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This referral is already ${referral.status}`,
      });
    }

    // Check referrer still has < 20 accepted referrals (in case of race condition)
    if (action === "accept") {
      const acceptedCount = await Referral.countDocuments({
        referrer: referral.referrer._id,
        status: "accepted",
      });
      if (acceptedCount >= 20) {
        return res.status(400).json({
          success: false,
          message:
            "The person who invited you has already reached their 20-referral limit.",
        });
      }
    }

    referral.status = action === "accept" ? "accepted" : "rejected";
    await referral.save();

    // Mark related notification as read
    await ReferralNotification.updateMany(
      { referral: referralId, recipient: userId },
      { isRead: true },
    );

    // Notify the referrer of the response
    const refereeName = `${req.user.firstName} ${req.user.lastName}`;
    const notifType =
      action === "accept" ? "referral_accepted" : "referral_rejected";
    const notifMessage =
      action === "accept"
        ? `${refereeName} has accepted your referral invitation! They are now part of your referral network.`
        : `${refereeName} has declined your referral invitation.`;

    const notification = await ReferralNotification.create({
      recipient: referral.referrer._id,
      sender: userId,
      referral: referral._id,
      type: notifType,
      message: notifMessage,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(referral.referrer._id.toString()).emit("referralNotification", {
        type: notifType,
        notification,
        from: refereeName,
      });
    }

    res.json({
      success: true,
      message:
        action === "accept"
          ? "You have accepted the referral invitation!"
          : "You have declined the referral invitation.",
      referral,
    });
  } catch (error) {
    console.error("respondToReferral error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/referrals/mine
// Get current user's referral list (people they referred)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyReferrals = async (req, res) => {
  try {
    const userId = req.user._id;

    const referrals = await Referral.find({ referrer: userId })
      .populate(
        "referee",
        "firstName lastName email profilePicture role createdAt",
      )
      .sort({ createdAt: -1 });

    // Compute totals
    const accepted = referrals.filter((r) => r.status === "accepted");
    const totalCommission = accepted.reduce(
      (sum, r) => sum + (r.totalCommissionEarned || 0),
      0,
    );

    // Get the user's referral earnings record
    const earningsRecord = await Earnings.findOne({ user: userId });
    const referralBalance = earningsRecord?.referralBalance || 0;

    res.json({
      success: true,
      data: {
        referrals,
        stats: {
          total: referrals.length,
          accepted: accepted.length,
          pending: referrals.filter((r) => r.status === "pending").length,
          rejected: referrals.filter((r) => r.status === "rejected").length,
          totalCommissionEarned: totalCommission,
          referralBalance: referralBalance,
          remainingSlots: 20 - accepted.length,
        },
      },
    });
  } catch (error) {
    console.error("getMyReferrals error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/referrals/notifications
// Get pending/unread referral notifications for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyReferralNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await ReferralNotification.find({ recipient: userId })
      .populate("sender", "firstName lastName email profilePicture")
      .populate({
        path: "referral",
        select: "status referrerName",
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    console.error("getMyReferralNotifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/referrals/notifications/:id/read
// Mark a notification as read
// ─────────────────────────────────────────────────────────────────────────────
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifId = req.params.id;

    const notif = await ReferralNotification.findOne({
      _id: notifId,
      recipient: userId,
    });

    if (!notif) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    notif.isRead = true;
    await notif.save();

    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("markNotificationRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/referrals/notifications/read-all
// Mark ALL notifications as read
// ─────────────────────────────────────────────────────────────────────────────
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await ReferralNotification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true },
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/referrals/admin/user-lookup?email=...   (admin only)
// Admin: look up a specific user by email and see their full Referral Center
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserReferralsByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address to search.",
      });
    }

    // 1) Find the user
    const targetUser = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("firstName lastName email role profilePicture createdAt isActive");

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "No registered user found with that email address.",
      });
    }

    // 2) Fetch all referrals where this user is the referrer
    const referrals = await Referral.find({ referrer: targetUser._id })
      .populate("referee", "firstName lastName email profilePicture role createdAt")
      .sort({ createdAt: -1 });

    // 3) Compute summary stats
    const accepted = referrals.filter((r) => r.status === "accepted");
    const pending  = referrals.filter((r) => r.status === "pending");
    const rejected = referrals.filter((r) => r.status === "rejected");

    const totalCommissionFromReferrals = accepted.reduce(
      (sum, r) => sum + (r.totalCommissionEarned || 0),
      0,
    );

    // 4) Fetch the user's Earnings record for the stored referralEarnings balance
    const earningsRecord = await Earnings.findOne({ user: targetUser._id });
    const referralEarningsBalance = earningsRecord?.referralEarnings || 0;
    const totalEarned             = earningsRecord?.totalEarned       || 0;
    const availableBalance        = earningsRecord?.availableBalance  || 0;

    res.json({
      success: true,
      data: {
        user: {
          _id:            targetUser._id,
          firstName:      targetUser.firstName,
          lastName:       targetUser.lastName,
          email:          targetUser.email,
          role:           targetUser.role,
          profilePicture: targetUser.profilePicture,
          createdAt:      targetUser.createdAt,
          isActive:       targetUser.isActive,
        },
        referrals,
        stats: {
          total:                      referrals.length,
          accepted:                   accepted.length,
          pending:                    pending.length,
          rejected:                   rejected.length,
          remainingSlots:             Math.max(0, 20 - accepted.length),
          totalCommissionFromReferrals,
          referralEarningsBalance,
          totalEarned,
          availableBalance,
        },
      },
    });
  } catch (error) {
    console.error("getUserReferralsByEmail error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/referrals/admin/all   (admin only)
// Admin view of all referral relationships
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllReferralsAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [referrals, total] = await Promise.all([
      Referral.find(filter)
        .populate("referrer", "firstName lastName email role")
        .populate("referee", "firstName lastName email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Referral.countDocuments(filter),
    ]);

    // Summary stats
    const [totalAccepted, totalPending, totalRejected, totalCommission] =
      await Promise.all([
        Referral.countDocuments({ status: "accepted" }),
        Referral.countDocuments({ status: "pending" }),
        Referral.countDocuments({ status: "rejected" }),
        Referral.aggregate([
          { $match: { status: "accepted" } },
          { $group: { _id: null, total: { $sum: "$totalCommissionEarned" } } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
        summary: {
          totalAccepted,
          totalPending,
          totalRejected,
          totalCommissionPaid: totalCommission[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    console.error("getAllReferralsAdmin error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/referrals/admin/withdrawal-bonus-events   (admin only)
// Returns recent withdrawal transactions that included a referral bonus payout
// ─────────────────────────────────────────────────────────────────────────────
exports.getWithdrawalBonusEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const events = await Transaction.find({ referralBonus: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "firstName lastName email")
      .lean();

    // Compute totals
    const totalBonusPaid = events.reduce((sum, e) => sum + (e.referralBonus || 0), 0);

    res.json({
      success: true,
      data: {
        events,
        totalBonusPaid: parseFloat(totalBonusPaid.toFixed(2)),
        count: events.length,
      },
    });
  } catch (error) {
    console.error("getWithdrawalBonusEvents error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/referrals/admin/by-email?email=xxx   (admin only)
// Look up a referrer by email and return their full Referral Center list
// plus total commission earnings received from those referrals
// ─────────────────────────────────────────────────────────────────────────────
exports.getReferralsByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address to search.",
      });
    }

    // Find the referrer user by email
    const referrer = await User.findOne({ email: email.toLowerCase() }).select(
      "firstName lastName email role createdAt profilePicture"
    );

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: "No registered user found with that email address.",
      });
    }

    // Fetch all referrals where this person is the referrer
    const referrals = await Referral.find({ referrer: referrer._id })
      .populate("referee", "firstName lastName email profilePicture role createdAt")
      .sort({ createdAt: -1 });

    // Compute totals
    const accepted = referrals.filter((r) => r.status === "accepted");
    const totalCommissionEarned = accepted.reduce(
      (sum, r) => sum + (r.totalCommissionEarned || 0),
      0
    );

    // Also fetch the referrer's referralBalance from Earnings
    const earningsRecord = await Earnings.findOne({ user: referrer._id });
    const referralBalance = earningsRecord?.referralBalance || 0;

    res.json({
      success: true,
      data: {
        referrer: {
          _id: referrer._id,
          firstName: referrer.firstName,
          lastName: referrer.lastName,
          email: referrer.email,
          role: referrer.role,
          createdAt: referrer.createdAt,
        },
        referrals,
        stats: {
          total: referrals.length,
          accepted: accepted.length,
          pending: referrals.filter((r) => r.status === "pending").length,
          rejected: referrals.filter((r) => r.status === "rejected").length,
          totalCommissionEarned: parseFloat(totalCommissionEarned.toFixed(2)),
          referralBalance: parseFloat(referralBalance.toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error("getReferralsByEmail error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

