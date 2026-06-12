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
          () => []
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
        0
      );
      const ytTotal = (ytSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 2),
        0
      );
      const reviewTotal = (reviewSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 30),
        0
      );
      const commentTotal = (commentSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 15),
        0
      );
      const googleTotal = (googleReviewsSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 40),
        0
      );
      const instagramTotal = (instagramSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amount || 1),
        0
      );
      const tiktokTotal = (tiktokSubmission || []).reduce(
        (sum, sub) => sum + (sub.amount || 1),
        0
      );
      const videoTotal = (videoSubmissions || []).reduce(
        (sum, sub) => sum + (sub.amountEarned || 0),
        0
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

      // Update earnings if needed
      if (earnings.totalEarned !== calculatedTotal) {
        earnings.totalEarned = calculatedTotal;
        earnings.availableBalance = Math.max(
          0,
          calculatedTotal -
            earnings.withdrawnAmount -
            earnings.pendingWithdrawal
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

    const transaction = await Transaction.create({
      user: req.user._id,
      type: "withdrawal",
      amount,
      status: "pending",
      reference: `WD-${Date.now()}`,
      bankDetails: {
        name: req.user.bankName,
        branch: req.user.bankBranch,
        account: req.user.bankAccountNo,
      },
    });

    earnings.availableBalance -= amount;
    earnings.withdrawnAmount += amount;
    await earnings.save();

    // Emit socket event if needed
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
