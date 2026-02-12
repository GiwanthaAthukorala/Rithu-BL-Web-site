const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const Link = require("../models/Link");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// Get all active links for a platform (filtering out completed ones)
router.get("/:platform", protect, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id;

    console.log(`Fetching links for platform: ${platform}, user: ${userId}`);

    // Validate platform
    const validPlatforms = [
      "facebook",
      "tiktok",
      "instagram",
      "youtube",
      "whatsapp",
    ];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid platform. Must be one of: facebook, tiktok, instagram, youtube, whatsapp",
      });
    }

    // Get user with clicked links
    const user = await User.findById(userId).select("clickedLinks");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get links that user has completed (clicked 4 times or submitted)
    const completedLinkIds = user.clickedLinks
      .filter((link) => {
        // Make sure link and link.linkId exist
        if (!link || !link.linkId) return false;

        return (
          link.platform === platform &&
          (link.submitted || link.clickCount >= link.maxClicks)
        );
      })
      .map((link) => {
        // Convert to string safely
        return link.linkId.toString
          ? link.linkId.toString()
          : String(link.linkId);
      });

    console.log(`Completed link IDs: ${completedLinkIds.join(", ")}`);

    // Get active links that user hasn't completed
    const links = await Link.find({
      platform,
      active: true,
      _id: {
        $nin: completedLinkIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });

    console.log(`Found ${links.length} active links`);

    // Add click count info to each link
    const linksWithClickInfo = links.map((link) => {
      const userLink = user.clickedLinks.find(
        (clicked) =>
          clicked.linkId && clicked.linkId.toString() === link._id.toString(),
      );

      return {
        _id: link._id,
        url: link.url,
        title: link.title,
        platform: link.platform,
        active: link.active,
        earnings: link.earnings,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        userClickCount: userLink ? userLink.clickCount : 0,
        maxClicks: userLink ? userLink.maxClicks : 20,
        remainingClicks: userLink
          ? userLink.maxClicks - userLink.clickCount
          : 20,
      };
    });

    res.json({ success: true, data: linksWithClickInfo });
  } catch (error) {
    console.error("Get links error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get links",
      error: error.message,
    });
  }
});

// Track link click
router.post("/:linkId/click", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    console.log(`Tracking click for link: ${linkId}, user: ${userId}`);

    // Validate linkId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    // Check if link exists
    const link = await Link.findById(linkId);
    if (!link || !link.active) {
      return res
        .status(404)
        .json({ success: false, message: "Link not found or inactive" });
    }

    // Find or create user's clicked link record
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let userLink = user.clickedLinks.find(
      (clicked) => clicked.linkId && clicked.linkId.toString() === linkId,
    );

    if (!userLink) {
      // First time clicking this link
      user.clickedLinks.push({
        linkId: new mongoose.Types.ObjectId(linkId),
        platform: link.platform,
        clickCount: 0,
        maxClicks: 20,
        submitted: false,
      });

      // Save and get the newly added link
      await user.save();

      // Refresh user to get the updated clickedLinks
      const updatedUser = await User.findById(userId);
      userLink = updatedUser.clickedLinks.find(
        (clicked) => clicked.linkId && clicked.linkId.toString() === linkId,
      );
    }

    // Check if user has reached the click limit
    if (userLink.clickCount >= userLink.maxClicks) {
      return res.status(400).json({
        success: false,
        message: "Maximum clicks reached for this link",
        maxClicksReached: true,
      });
    }

    // Increment click count
    userLink.clickCount += 1;
    userLink.lastClickedAt = new Date();

    await user.save();

    res.json({
      success: true,
      clickCount: userLink.clickCount,
      maxClicks: userLink.maxClicks,
      remainingClicks: userLink.maxClicks - userLink.clickCount,
    });
  } catch (error) {
    console.error("Link click error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track link click",
      error: error.message,
    });
  }
});

// Mark link as submitted (when user uploads screenshot)
router.post("/:linkId/submit", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    console.log(`Marking link as submitted: ${linkId}, user: ${userId}`);

    // Validate linkId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    // Update user's clicked link to mark as submitted
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const clickedLink = user.clickedLinks.find(
      (link) => link.linkId && link.linkId.toString() === linkId,
    );

    if (clickedLink) {
      clickedLink.submitted = true;
      clickedLink.submittedAt = new Date();
      await user.save();

      return res.json({ success: true, message: "Link marked as submitted" });
    } else {
      return res.status(404).json({
        success: false,
        message: "Link not found in user's clicked links",
      });
    }
  } catch (error) {
    console.error("Link submit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark link as submitted",
      error: error.message,
    });
  }
});

// Reset link clicks for current user
router.post("/:linkId/reset", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    // Validate linkId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const clickedLinkIndex = user.clickedLinks.findIndex(
      (link) => link.linkId && link.linkId.toString() === linkId,
    );

    if (clickedLinkIndex !== -1) {
      user.clickedLinks[clickedLinkIndex].clickCount = 0;
      user.clickedLinks[clickedLinkIndex].submitted = false;
      user.clickedLinks[clickedLinkIndex].submittedAt = null;
      await user.save();

      return res.json({ success: true, message: "Link clicks reset" });
    } else {
      return res.status(404).json({
        success: false,
        message: "Link not found in user's clicked links",
      });
    }
  } catch (error) {
    console.error("Link reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset link clicks",
      error: error.message,
    });
  }
});

// Get all links (admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    const links = await Link.find({});
    res.json({ success: true, data: links });
  } catch (error) {
    console.error("Get all links error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get links",
      error: error.message,
    });
  }
});

// Create new link (admin only)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { url, title, platform, earnings } = req.body;

    // Validate required fields
    if (!url || !title || !platform) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: url, title, platform",
      });
    }

    // Validate platform
    const validPlatforms = [
      "facebook",
      "tiktok",
      "instagram",
      "youtube",
      "whatsapp",
    ];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid platform. Must be one of: facebook, tiktok, instagram, youtube, whatsapp",
      });
    }

    const link = await Link.create({
      url,
      title,
      platform,
      earnings: earnings || 1.0,
    });

    res.json({ success: true, data: link });
  } catch (error) {
    console.error("Create link error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A link with this URL already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create link",
      error: error.message,
    });
  }
});

// Update link (admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { url, title, platform, earnings, active } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { url, title, platform, earnings, active },
      { new: true, runValidators: true },
    );

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    res.json({ success: true, data: link });
  } catch (error) {
    console.error("Update link error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A link with this URL already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update link",
      error: error.message,
    });
  }
});

// Reset all user clicks for a link (admin only)
router.post("/:linkId/reset-all", protect, admin, async (req, res) => {
  try {
    const { linkId } = req.params;

    // Validate linkId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    // Reset clicks for all users
    const result = await User.updateMany(
      { "clickedLinks.linkId": new mongoose.Types.ObjectId(linkId) },
      {
        $set: {
          "clickedLinks.$.clickCount": 0,
          "clickedLinks.$.submitted": false,
          "clickedLinks.$.submittedAt": null,
        },
      },
    );

    res.json({
      success: true,
      message: `Reset clicks for ${result.modifiedCount} users`,
    });
  } catch (error) {
    console.error("Reset all clicks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset all clicks",
      error: error.message,
    });
  }
});

module.exports = router;
