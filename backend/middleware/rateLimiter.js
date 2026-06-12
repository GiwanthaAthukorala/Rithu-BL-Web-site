{
  /*const Submission = require("../models/Submission");

const MAX_SUBMISSIONS_PER_DAY = 18;
const HOURS_LIMIT = 24;

const submissionRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const twentyFourHoursAgo = new Date(
      now.getTime() - HOURS_LIMIT * 60 * 60 * 1000
    );

    // Count submissions in last 24 hours
    const submissionCount = await Submission.countDocuments({
      user: userId,
      createdAt: { $gte: twentyFourHoursAgo },
      status: { $in: ["pending", "approved"] }, // Count both pending and approved
    });

    if (submissionCount >= MAX_SUBMISSIONS_PER_DAY) {
      // Find the oldest submission in the current window
      const oldestSubmission = await Submission.findOne({
        user: userId,
        createdAt: { $gte: twentyFourHoursAgo },
      }).sort({ createdAt: 1 });

      const nextSubmissionTime = new Date(
        oldestSubmission.createdAt.getTime() + HOURS_LIMIT * 60 * 60 * 1000
      );

      return res.status(429).json({
        success: false,
        message: `You've reached the maximum of ${MAX_SUBMISSIONS_PER_DAY} submissions in 24 hours.`,
        limit: MAX_SUBMISSIONS_PER_DAY,
        remaining: 0,
        nextSubmissionTime: nextSubmissionTime,
        retryAfter: Math.ceil((nextSubmissionTime - now) / 1000),
      });
    }

    // Add submission info to request for use in controller
    req.submissionInfo = {
      remaining: MAX_SUBMISSIONS_PER_DAY - submissionCount,
    };

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next(error);
  }
};

module.exports = submissionRateLimiter;
*/
}
