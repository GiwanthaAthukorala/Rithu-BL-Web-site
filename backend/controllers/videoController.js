const Video = require("../models/Video");
const VideoWatchSession = require("../models/VideoWatchSession");
const Earnings = require("../models/Earnings");

// Enhanced video controller with better error handling
exports.getAvailableVideos = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count completed watch sessions per video for the user
    const completedSessions = await VideoWatchSession.aggregate([
      { $match: { user: userId, status: "completed" } },
      { $group: { _id: "$video", count: { $sum: 1 } } },
    ]);

    // Find video IDs that have been watched 20 or more times
    const fullyWatchedVideoIds = completedSessions
      .filter((session) => session.count >= 20)
      .map((session) => session._id);

    const availableVideos = await Video.find({
      isActive: true,
      _id: { $nin: fullyWatchedVideoIds },
      $or: [{ maxViews: { $gt: 0 } }, { maxViews: null }],
    });

    // Filter out videos that reached max views
    const filteredVideos = availableVideos.filter(
      (video) => video.maxViews === null || video.currentViews < video.maxViews
    );

    res.json({
      success: true,
      data: filteredVideos,
    });
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
    });
  }
};

// Enhanced session management
exports.startVideoSession = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Check if video exists and is active
    const video = await Video.findOne({
      _id: videoId,
      isActive: true,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found or inactive",
      });
    }

    // Check if video reached max views
    if (video.maxViews && video.currentViews >= video.maxViews) {
      return res.status(400).json({
        success: false,
        message: "This video has reached its maximum view limit",
      });
    }

    // Check if user already completed this video 20 or more times
    const completedCount = await VideoWatchSession.countDocuments({
      user: userId,
      video: videoId,
      status: "completed",
    });

    if (completedCount >= 20) {
      return res.status(400).json({
        success: false,
        message: "You have already watched this video the maximum limit of 20 times",
      });
    }

    // Check if there's an existing watching session
    const existingWatchingSession = await VideoWatchSession.findOne({
      user: userId,
      video: videoId,
      status: { $in: ["watching", "paused"] },
    });

    let session;
    if (existingWatchingSession) {
      // Resume existing session
      session = existingWatchingSession;
      session.startTime = new Date();
      session.status = "watching";
    } else {
      // Create new session
      session = await VideoWatchSession.create({
        user: userId,
        video: videoId,
        startTime: new Date(),
        status: "watching",
        watchDuration: 0,
      });
    }

    await session.save();

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        video: video,
        startTime: session.startTime,
        platform: video.platform,
        duration: video.duration,
      },
    });
  } catch (error) {
    console.error("Start video session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start video session",
    });
  }
};

// Enhanced progress tracking
exports.updateWatchProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentTime, isCompleted = false } = req.body;
    const userId = req.user._id;

    const session = await VideoWatchSession.findOne({
      _id: sessionId,
      user: userId,
    }).populate("video");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // If video already completed, return success but don't process further
    if (session.status === "completed") {
      return res.json({
        success: true,
        data: {
          watchDuration: session.watchDuration,
          status: session.status,
          rewardGiven: session.rewardGiven,
          amountEarned: session.amountEarned,
          message: "Video already completed",
        },
      });
    }

    // Update watch duration
    session.watchDuration = Math.max(session.watchDuration, currentTime);

    // Check if video is completed
    const requiredDuration = session.video.duration;
    if (
      (currentTime >= requiredDuration || isCompleted) &&
      !session.rewardGiven
    ) {
      console.log(
        `Video completed! User: ${userId}, Duration: ${currentTime}s`
      );
      await completeVideoSession(session);
    }

    await session.save();

    res.json({
      success: true,
      data: {
        watchDuration: session.watchDuration,
        status: session.status,
        rewardGiven: session.rewardGiven,
        amountEarned: session.amountEarned,
        progress: Math.min(
          100,
          (session.watchDuration / requiredDuration) * 100
        ),
      },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};

// Enhanced completion handler
const completeVideoSession = async (session) => {
  try {
    session.status = "completed";
    session.endTime = new Date();
    session.rewardGiven = true;
    session.amountEarned = session.video.rewardAmount;

    console.log(`Awarding Rs ${session.amountEarned} to user ${session.user}`);

    // Update video views
    await Video.findByIdAndUpdate(session.video._id, {
      $inc: { currentViews: 1 },
    });

    // Update user earnings
    await updateUserEarnings(session.user, session.video.rewardAmount);

    await session.save();

    // Emit socket event for real-time update
    const io = require("../server").io;
    if (io) {
      io.to(session.user.toString()).emit("videoCompleted", {
        videoId: session.video._id,
        videoTitle: session.video.title,
        amount: session.video.rewardAmount,
        sessionId: session._id,
      });
    }

    console.log(
      `Successfully awarded Rs ${session.amountEarned} to user ${session.user}`
    );
  } catch (error) {
    console.error("Complete session error:", error);
    throw error;
  }
};

// Update user earnings (fixed - remove dbSession parameter)
const updateUserEarnings = async (userId, amount) => {
  try {
    let earnings = await Earnings.findOne({ user: userId });

    if (!earnings) {
      earnings = await Earnings.create({
        user: userId,
        totalEarned: amount,
        availableBalance: amount,
      });
      console.log(
        `Created new earnings record for user ${userId} with Rs ${amount}`
      );
    } else {
      earnings.totalEarned += amount;
      earnings.availableBalance += amount;
      await earnings.save();
      console.log(
        `Updated earnings for user ${userId}: Total: Rs ${earnings.totalEarned}, Available: Rs ${earnings.availableBalance}`
      );
    }

    return earnings;
  } catch (error) {
    console.error("Update earnings error:", error);
    throw error;
  }
};

// Get user's video watch history
exports.getWatchHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await VideoWatchSession.find({
      user: userId,
    })
      .populate("video")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watch history",
    });
  }
};
