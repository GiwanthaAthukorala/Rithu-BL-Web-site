const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");
const Submission = require("../models/Submission");
const YoutubeSubmission = require("../models/YoutubeSubmission");
const FbReviewSubmission = require("../models/FbReviewSubmission");
const FbCommentSubmission = require("../models/FbCommentSubmission");
const GoogleReviewModel = require("../models/GoogleReviewModel");
const VideoWatchSession = require("../models/VideoWatchSession");
const Instrgram = require("../models/InstrgramModel");
const TiktokSubmission = require("../models/TiktokModel");
const Referral = require("../models/Referral");
const ReferralNotification = require("../models/ReferralNotification");

exports.getUserEarnings = async (req, res) => {
  try {
    console.log("Fetching earnings for user:", req.user._id);

    // First, try to find existing earnings
    let earnings = await Earnings.findOne({ user: req.user._id });

    // If no earnings record exists, create one
    if (!earnings) {
      console.log("No earnings record found, creating new one");
      earnings = await Earnings.create({
        user: req.user._id,
        totalEarned: 0,
        availableBalance: 0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
        referralBalance: 0,
      });
    }

    // Calculate earnings from all submission types
    try {
      const [
        fbSubmissions,
        ytSubmissions,
        reviewSubmissions,
        commentSubmissions,
        googleReviewsSubmissions,
        instagramSubmissions,
        tiktokSubmission,
        videoSubmissions,
      ] = await Promise.all([
        Submission.find({ user: req.user._id, status: "approved" }).catch(
          () => [],
        ),
        YoutubeSubmission.find({
          user: req.user._id,
          status: "approved",
        }).catch(() => []),
        FbReviewSubmission.find({
          user: req.user._id,
          status: "approved",
        }).catch(() => []),
        FbCommentSubmission.find({
          user: req.user._id,
          status: "approved",
        }).catch(() => []),
        GoogleReviewModel.find({
          user: req.user._id,
          status: "approved",
        }).catch(() => []),
        Instrgram.find({
          user: req.user._id,
          status: "approved",
        }).catch(() => []),
        TiktokSubmission.find({
          user: req.user._id,
          status: "approved",
        }).catch(() => []),
        VideoWatchSession.find({
          user: req.user._id,
          status: "completed",
        }).catch(() => []),
      ]);

      // Calculate totals with fallbacks
      const fbTotal = (fbSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 1),
        0,
      );
      const ytTotal = (ytSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 2),
        0,
      );
      const reviewTotal = (reviewSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 30),
        0,
      );
      const commentTotal = (commentSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 10),
        0,
      );
      const googleTotal = (googleReviewsSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 40),
        0,
      );
      const instagramTotal = (instagramSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 1),
        0,
      );
      const tiktokTotal = (tiktokSubmission || []).reduce(
        (sum, sub) => sum + (sub.amount || 1),
        0,
      );
      const videoTotal = (videoSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amountEarned || 0),
        0,
      );

      const calculatedTotal =
        fbTotal +
        ytTotal +
        reviewTotal +
        commentTotal +
        googleTotal +
        instagramTotal +
        tiktokTotal +
        videoTotal;

      // The submission-based total (does NOT include referral commissions)
      const submissionTotal = calculatedTotal;
      // Referral earnings are credited separately and must be preserved
      const referralEarnings = earnings.referralEarnings || 0;
      // Full total = submission earnings + referral commissions
      const fullTotal = submissionTotal + referralEarnings;
      const referralCredit = earnings.referralBalance || 0;

      // Update earnings if the submission-based portion has changed
      if (earnings.totalEarned !== fullTotal) {
        earnings.totalEarned = fullTotal;
        earnings.availableBalance = Math.max(
          0,
          fullTotal -
            earnings.withdrawnAmount -
            earnings.pendingWithdrawal +
            referralCredit,
        );
        await earnings.save();
      }

      res.json({
        success: true,
        data: earnings,
      });
    } catch (calculationError) {
      console.error("Earnings calculation error:", calculationError);
      // Still return the basic earnings data even if calculation fails
      res.json({
        success: true,
        data: earnings,
      });
    }
  } catch (error) {
    console.error("Earnings route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get earnings",
      error: error.message,
    });
  }
};

exports.withdrawEarnings = async (req, res) => {
  try {
    const { amount } = req.body;
    const minWithdrawal = 500;

    if (!amount || amount < minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is Rs ${minWithdrawal}`,
      });
    }

    const earnings = await Earnings.findOne({ user: req.user._id });

    if (!earnings || earnings.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance for withdrawal",
      });
    }

    // Withdrawal only draws from the work-earnings availableBalance.
    // referralBalance is a completely separate pool and is NOT mixed in here.
    const transaction = await Transaction.create({
      user: req.user._id,
      type: "withdrawal",
      amount: amount,
      status: "pending",
      reference: `WD-${Date.now()}`,
      bankDetails: {
        name: req.user.bankName,
        branch: req.user.bankBranch,
        account: req.user.bankAccountNo,
      },
    });

    // Deduct from work-earnings balance only
    earnings.availableBalance -= amount;
    earnings.withdrawnAmount += amount;
    await earnings.save();

    // ── Referral Commission: 5% to referrer ──────────────────────────────
    try {
      const referralRecord = await Referral.findOne({
        referee: req.user._id,
        status: "accepted",
      }).populate("referrer", "firstName lastName");

      if (referralRecord) {
        const commission = parseFloat((amount * 0.05).toFixed(2));

        // Credit referrer's referralBalance AND also add to totalEarned/availableBalance
        let referrerEarnings = await Earnings.findOne({
          user: referralRecord.referrer._id,
        });
        if (!referrerEarnings) {
          referrerEarnings = await Earnings.create({
            user: referralRecord.referrer._id,
            totalEarned: 0,
            availableBalance: 0,
            pendingWithdrawal: 0,
            withdrawnAmount: 0,
            referralBalance: 0,
          });
        }

        // Add commission to referralBalance (separate display) AND to overall earnings
        referrerEarnings.referralBalance += commission;
        referrerEarnings.totalEarned += commission;
        referrerEarnings.availableBalance += commission;
        await referrerEarnings.save();

        // Update commission history on the referral record
        referralRecord.totalCommissionEarned += commission;
        referralRecord.commissionHistory.push({
          withdrawalAmount: amount,
          commissionAmount: commission,
          date: new Date(),
        });
        await referralRecord.save();

        // Record the referral bonus on the transaction so the admin panel
        // query (referralBonus > 0) correctly surfaces this event
        await Transaction.findByIdAndUpdate(transaction._id, {
          referralBonus: commission,
        });

        // In-app notification for referrer
        const refereeName = `${req.user.firstName} ${req.user.lastName}`;
        const notif = await ReferralNotification.create({
          recipient: referralRecord.referrer._id,
          sender: req.user._id,
          referral: referralRecord._id,
          type: "referral_commission",
          message: `You earned Rs ${commission.toFixed(2)} (5%) referral commission from ${refereeName}'s withdrawal of Rs ${amount}. Added to your Referral Balance and Total Earnings.`,
          meta: { commission, withdrawalAmount: amount },
        });

        // Emit socket events
        const io = req.app.get("io");
        if (io) {
          io.to(referralRecord.referrer._id.toString()).emit(
            "earningsUpdate",
            referrerEarnings,
          );
          io.to(referralRecord.referrer._id.toString()).emit(
            "referralNotification",
            {
              type: "referral_commission",
              notification: notif,
              commission,
              from: refereeName,
            },
          );
        }
      }
    } catch (commissionError) {
      // Don't fail the withdrawal if commission processing fails
      console.error("Referral commission error:", commissionError);
    }
    // ─────────────────────────────────────────────────────────────────────

    // Emit socket event to withdrawer
    const io = req.app.get("io");
    if (io) {
      io.to(req.user._id.toString()).emit("earningsUpdate", earnings);
      io.to(req.user._id.toString()).emit("withdrawalSuccess", {
        message: "Withdrawal processed successfully!",
        amount: amount,
        transaction: transaction,
      });
    }

    res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      earnings: earnings,
      transaction: transaction,
      amount,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({
      success: false,
      message: "Withdrawal failed",
      error: error.message,
    });
  }
};
