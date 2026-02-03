const User = require("../models/userModel");
const Submission = require("../models/Submission");
const YoutubeSubmission = require("../models/YoutubeSubmission");
const FbReviewSubmission = require("../models/FbReviewSubmission");
const FbCommentSubmission = require("../models/FbCommentSubmission");
const GoogleReviewSubmission = require("../models/GoogleReviewModel");
const Instrgram = require("../models/InstrgramModel");
const TiktokSubmission = require("../models/TiktokModel");
const jwt = require("jsonwebtoken");

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user with password selected
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is admin
    if (!user.isAdmin()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account deactivated. Please contact super admin.",
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Return user data without password
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Admin Logout
const adminLogout = (req, res) => {
  res.json({
    success: true,
    message: "Admin logout successful",
  });
};

// Get all submissions with enhanced filtering
const getAllSubmissions = async (req, res) => {
  try {
    const {
      page = 20,
      limit = 100,
      platform,
      platformType,
      status,
      dateFrom,
      dateTo,
      userId,
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object for each model
    const buildFilter = (baseFilter = {}) => {
      const filter = { ...baseFilter };
      if (status && status !== "all") filter.status = status;
      if (userId) filter.user = userId;

      // Date range filter
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = endDate;
        }
      }

      return filter;
    };

    // Search by user name or email
    let userFilter = {};
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      userFilter.user = { $in: users.map((u) => u._id) };
    }

    // Get submissions from all platforms with proper filtering
    const [
      fbSubmissions,
      youtubeSubmissions,
      fbReviewSubmissions,
      fbCommentSubmissions,
      googleReviewSubmissions,
      instagramSubmissions,
      tiktokSubmission,
    ] = await Promise.all([
      // Facebook Page Submissions
      Submission.find(buildFilter({ ...userFilter }))
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .lean(),

      // YouTube Submissions
      YoutubeSubmission.find(buildFilter(userFilter))
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .lean(),

      // Facebook Review Submissions
      FbReviewSubmission.find(buildFilter(userFilter))
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .lean(),

      // Facebook Comment Submissions
      FbCommentSubmission.find(buildFilter(userFilter))
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .lean(),

      // Google Review Submissions
      GoogleReviewSubmission.find(buildFilter(userFilter))
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .lean(),

      Instrgram.find(buildFilter(userFilter))
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .lean(),

      TiktokSubmission.find(buildFilter(userFilter))
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Combine all submissions with platform type and proper identification
    // Combine all submissions with proper platform identification
    const allSubmissions = [
      ...fbSubmissions.map((sub) => ({
        ...sub,
        platformType: "facebook",
        submissionType: "page",
        combinedId: `facebook_page_${sub._id}`,
        _id: `facebook_page_${sub._id}`,
      })),
      ...youtubeSubmissions.map((sub) => ({
        ...sub,
        platformType: "youtube",
        submissionType: "video",
        combinedId: `youtube_video_${sub._id}`,
        _id: `youtube_video_${sub._id}`,
      })),
      ...fbReviewSubmissions.map((sub) => ({
        ...sub,
        platformType: "facebook",
        submissionType: "review",
        combinedId: `facebook_review_${sub._id}`,
        _id: `facebook_review_${sub._id}`,
      })),
      ...fbCommentSubmissions.map((sub) => ({
        ...sub,
        platformType: "facebook",
        submissionType: "comment",
        combinedId: `facebook_comment_${sub._id}`,
        _id: `facebook_comment_${sub._id}`,
      })),
      ...googleReviewSubmissions.map((sub) => ({
        ...sub,
        platformType: "google",
        submissionType: "review",
        combinedId: `google_review_${sub._id}`,
        _id: `google_review_${sub._id}`,
      })),
      ...instagramSubmissions.map((sub) => ({
        ...sub,
        platformType: "Instrgram", // ✅ Changed from "Instrgram"
        submissionType: "page",
        combinedId: `Instrgram_page_${sub._id}`,
        _id: `Instrgram_page_${sub._id}`,
      })),
      ...tiktokSubmission.map((sub) => ({
        ...sub,
        platformType: "Tiktok", // ✅ Changed from "Tiktok"
        submissionType: "page",
        combinedId: `Tiktok_page_${sub._id}`,
        _id: `Tiktok_page_${sub._id}`,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let filteredSubmissions = allSubmissions;
    if (platform && platform !== "all") {
      filteredSubmissions = allSubmissions.filter(
        (sub) => sub.platformType === platform,
      );
    }

    // Apply status filter
    if (status && status !== "all") {
      filteredSubmissions = filteredSubmissions.filter(
        (sub) => sub.status === status,
      );
    }

    // Paginate results
    const startIndex = skip;
    const endIndex = startIndex + limitNum;
    const paginatedSubmissions = filteredSubmissions.slice(
      startIndex,
      endIndex,
    );

    // Get counts for statistics
    const totalCount = filteredSubmissions.length;

    // Status counts
    const statusCounts = {
      pending: filteredSubmissions.filter((s) => s.status === "pending").length,
      approved: filteredSubmissions.filter((s) => s.status === "approved")
        .length,
      rejected: filteredSubmissions.filter((s) => s.status === "rejected")
        .length,
    };

    res.json({
      success: true,
      data: {
        submissions: paginatedSubmissions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalSubmissions: totalCount,
          hasNext: endIndex < totalCount,
          hasPrev: pageNum > 1,
        },
        statusCounts,
        filters: {
          platform: platform || "all",
          status: status || "all",
          search: search || "",
          dateFrom: dateFrom || "",
          dateTo: dateTo || "",
        },
      },
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// Get submission by ID
const getSubmissionById = async (req, res) => {
  try {
    const { platformType, submissionId } = req.params;

    let Model;
    let submissionType;

    // Determine model based on platformType
    switch (platformType) {
      case "facebook_page":
        Model = Submission;
        submissionType = "page";
        break;
      case "youtube_video":
        Model = YoutubeSubmission;
        submissionType = "video";
        break;
      case "facebook_review":
        Model = FbReviewSubmission;
        submissionType = "review";
        break;
      case "facebook_comment":
        Model = FbCommentSubmission;
        submissionType = "comment";
        break;
      case "google_review":
        Model = GoogleReviewSubmission;
        submissionType = "review";
        break;
      case "Instrgram": // ✅ Fixed
        Model = Instrgram;
        submissionType = "page";
        break;
      case "Tiktok": // ✅ Fixed
        Model = TiktokSubmission;
        submissionType = "page";
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid platform type",
        });
    }

    const submission = await Model.findById(submissionId).populate("user");

    if (!submission) {
      return res.status(404).json({
        success: false,
        validTypes: [
          "facebook_page",
          "youtube_video",
          "facebook_review",
          "facebook_comment",
          "google_review",
          "Instrgram",
          "Tiktok",
        ],
        message: "Submission not found",
      });
    }

    // Add platform info to submission
    const submissionWithPlatform = {
      ...submission.toObject(),
      platformType: platformType.split("_")[0],
      submissionType: submissionType,
      combinedId: `${platformType}_${submission._id}`,
    };

    res.json({
      success: true,
      data: submissionWithPlatform,
    });
  } catch (error) {
    console.error("Get submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};

// Update submission status
const updateSubmissionStatus = async (req, res) => {
  try {
    const { combinedId, status, rejectionReason } = req.body;

    if (!combinedId || !["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid combinedId and status (approved/rejected/pending) are required",
      });
    }

    // Parse combinedId to get platformType and actual ID
    const [platform, type, ...idParts] = combinedId.split("_");
    const platformType = `${platform}_${type}`;
    const actualId = idParts.join("_");

    let Model;

    // Determine which model to use based on platform type
    switch (platformType) {
      case "facebook_page":
        Model = Submission;
        break;
      case "youtube_video":
        Model = YoutubeSubmission;
        break;
      case "facebook_review":
        Model = FbReviewSubmission;
        break;
      case "facebook_comment":
        Model = FbCommentSubmission;
        break;
      case "Instrgram":
        Model = Instrgram;
        break;
      case "Tiktok":
        Model = TiktokSubmission;
        break;
      case "google_review":
        Model = GoogleReviewSubmission;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid platform type",
        });
    }

    const submission = await Model.findById(actualId).populate("user");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    submission.status = status;
    if (status === "rejected" && rejectionReason) {
      submission.rejectionReason = rejectionReason;
    } else {
      submission.rejectionReason = undefined;
    }

    await submission.save();

    res.json({
      success: true,
      message: `Submission ${status} successfully`,
      data: submission,
    });
  } catch (error) {
    console.error("Update submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update submission",
      error: error.message,
    });
  }
};

// Delete submission
const deleteSubmission = async (req, res) => {
  try {
    const { platformType, submissionId } = req.params;

    let Model;
    let actualId = submissionId;

    console.log(`Attempting to delete submission:`, {
      platformType,
      submissionId,
    });

    // Determine which model to use based on platform type
    switch (platformType) {
      case "facebook_page":
        Model = Submission;
        break;
      case "youtube_video":
        Model = YoutubeSubmission;
        break;
      case "facebook_review":
        Model = FbReviewSubmission;
        break;
      case "facebook_comment":
        Model = FbCommentSubmission;
        break;
      case "Instrgram": // ✅ Fixed: removed extra space
        Model = Instrgram;
        break;
      case "Tiktok": // ✅ Fixed: lowercase to match route
        Model = TiktokSubmission;
        break;
      case "google_review":
        Model = GoogleReviewSubmission;
        break;
      default:
        console.error(`Invalid platform type: ${platformType}`);
        return res.status(400).json({
          success: false,
          validTypes: [
            "facebook_page",
            "youtube_video",
            "facebook_review",
            "facebook_comment",
            "google_review",
            "Instrgram",
            "Tiktok",
          ],
          message: `Invalid platform type: ${platformType}`,
        });
    }

    console.log(`Using model: ${Model.modelName}, ID: ${actualId}`);

    const submission = await Model.findByIdAndDelete(actualId);

    if (!submission) {
      console.error(`Submission not found with ID: ${actualId}`);
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    console.log(`Successfully deleted submission:`, submission._id);

    res.json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete submission",
      error: error.message,
    });
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      recentSubmissions,
      topUsers,
    ] = await Promise.all([
      // Total submissions count
      Promise.all([
        Submission.countDocuments(),
        YoutubeSubmission.countDocuments(),
        FbReviewSubmission.countDocuments(),
        FbCommentSubmission.countDocuments(),
        Instrgram.countDocuments(),
        TiktokSubmission.countDocuments(),
        GoogleReviewSubmission.countDocuments(),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Pending submissions
      Promise.all([
        Submission.countDocuments({ status: "pending" }),
        YoutubeSubmission.countDocuments({ status: "pending" }),
        FbReviewSubmission.countDocuments({ status: "pending" }),
        FbCommentSubmission.countDocuments({ status: "pending" }),
        TiktokSubmission.countDocuments({ status: "pending" }),
        Instrgram.countDocuments({ status: "pending" }),
        GoogleReviewSubmission.countDocuments({ status: "pending" }),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Approved submissions
      Promise.all([
        Submission.countDocuments({ status: "approved" }),
        YoutubeSubmission.countDocuments({ status: "approved" }),
        FbReviewSubmission.countDocuments({ status: "approved" }),
        FbCommentSubmission.countDocuments({ status: "approved" }),
        GoogleReviewSubmission.countDocuments({ status: "approved" }),
        Instrgram.countDocuments({ status: "approved" }),
        TiktokSubmission.countDocuments({ status: "approved" }),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Rejected submissions
      Promise.all([
        Submission.countDocuments({ status: "rejected" }),
        YoutubeSubmission.countDocuments({ status: "rejected" }),
        FbReviewSubmission.countDocuments({ status: "rejected" }),
        FbCommentSubmission.countDocuments({ status: "rejected" }),
        Instrgram.countDocuments({ status: "rejected" }),
        TiktokSubmission.countDocuments({ status: "rejected" }),

        GoogleReviewSubmission.countDocuments({ status: "rejected" }),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Recent submissions (last 30 days)
      Promise.all([
        Submission.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        YoutubeSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
        FbReviewSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
        FbCommentSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
        Instrgram.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
        TiktokSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
        GoogleReviewSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Top users by submissions
      User.aggregate([
        {
          $lookup: {
            from: "submissions",
            localField: "_id",
            foreignField: "user",
            as: "fbSubmissions",
          },
        },
        {
          $lookup: {
            from: "youtubesubmissions",
            localField: "_id",
            foreignField: "user",
            as: "ytSubmissions",
          },
        },
        {
          $lookup: {
            from: "fbreviewsubmissions",
            localField: "_id",
            foreignField: "user",
            as: "fbReviewSubmissions",
          },
        },
        {
          $lookup: {
            from: "fbcommentsubmissions",
            localField: "_id",
            foreignField: "user",
            as: "fbCommentSubmissions",
          },
        },
        {
          $lookup: {
            from: "Instrgram",
            localField: "_id",
            foreignField: "user",
            as: "instagramSubmissions",
          },
        },
        {
          $lookup: {
            from: "tiktoksubmissions",
            localField: "_id",
            foreignField: "user",
            as: "tiktokSubmissions",
          },
        },

        {
          $lookup: {
            from: "googlereviewsubmissions",
            localField: "_id",
            foreignField: "user",
            as: "googleReviewSubmissions",
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            phoneNumber: 1,
            totalSubmissions: {
              $add: [
                { $size: "$fbSubmissions" },
                { $size: "$ytSubmissions" },
                { $size: "$fbReviewSubmissions" },
                { $size: "$fbCommentSubmissions" },
                { $size: "$instagramSubmissions" },
                { $size: "$tiktokSubmissions" },
                { $size: "$googleReviewSubmissions" },
              ],
            },
            approvedSubmissions: {
              $add: [
                {
                  $size: {
                    $filter: {
                      input: "$fbSubmissions",
                      as: "sub",
                      cond: { $eq: ["$$sub.status", "approved"] },
                    },
                  },
                },
                {
                  $size: {
                    $filter: {
                      input: "$ytSubmissions",
                      as: "sub",
                      cond: { $eq: ["$$sub.status", "approved"] },
                    },
                  },
                },
                {
                  $size: {
                    $filter: {
                      input: "$fbReviewSubmissions",
                      as: "sub",
                      cond: { $eq: ["$$sub.status", "approved"] },
                    },
                  },
                },
                {
                  $size: {
                    $filter: {
                      input: "$fbCommentSubmissions",
                      as: "sub",
                      cond: { $eq: ["$$sub.status", "approved"] },
                    },
                  },
                },
                {
                  $size: {
                    $filter: {
                      input: "$googleReviewSubmissions",
                      as: "sub",
                      cond: { $eq: ["$$sub.status", "approved"] },
                    },
                  },
                },
              ],
            },
          },
        },
        { $sort: { totalSubmissions: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalSubmissions,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        recentSubmissions,
        topUsers,
        earnings: {
          totalEarned: approvedSubmissions * 1.0,
          pendingAmount: pendingSubmissions * 1.0,
        },
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// Get all users (super admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = "" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalUsers = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalUsers / limitNum),
          totalUsers,
          hasNext: pageNum < Math.ceil(totalUsers / limitNum),
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Toggle user status (super admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deactivating super admin
    if (
      user.isSuperAdmin() &&
      req.user._id.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot deactivate another super admin",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// Create admin user (super admin only)
const createAdminUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role = "admin",
    } = req.body;

    if (!["admin", "superadmin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'admin' or 'superadmin'",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const adminUser = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role,
      isActive: true,
      bankName: "Admin Bank",
      bankBranch: "Admin Branch",
      bankAccountNo: "0000000000000000",
    });

    await adminUser.save();

    // Return user without password
    const userResponse = {
      _id: adminUser._id,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive,
      createdAt: adminUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: `${role} user created successfully`,
      data: userResponse,
    });
  } catch (error) {
    console.error("Create admin user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admin user",
      error: error.message,
    });
  }
};

// Add this method if it was referenced but missing
const getSystemStats = async (req, res) => {
  try {
    // Basic system statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({
      role: { $in: ["admin", "superadmin"] },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        inactiveUsers: totalUsers - activeUsers,
      },
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system statistics",
      error: error.message,
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  createAdminUser,
  getSystemStats, // Add this if you want to use it
};
