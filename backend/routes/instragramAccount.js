const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addInstagramAccount,
  getUserInstagramAccounts,
  updateInstagramAccount,
  deleteInstagramAccount,
  toggleAccountStatus,
  verifyInstagramAccount,
  getAccountUsage,
} = require("../controllers/instrgramAccountController");

// All routes require authentication
router.use(protect);

// CRUD operations
router.post("/", addInstagramAccount);
router.get("/", getUserInstagramAccounts);
router.put("/:InstagramaccountId", updateInstagramAccount);
router.delete("/:InstagramAccountId", deleteInstagramAccount);
router.patch("/:InstagramaccountId/toggle-status", toggleAccountStatus);
router.post("/:InstagramaccountId/verify", verifyInstagramAccount);
router.get("/:InstagramaccountId/usage", getAccountUsage);

// Get available slots count - FIXED version
router.get("/available-slots", async (req, res) => {
  try {
    const user = req.user;
    const availableSlots = 20 - (user.instagramAccounts?.length || 0);
    res.json({
      success: true,
      availableSlots,
      total: 20,
      used: user.instagramAccounts?.length || 0,
    });
  } catch (error) {
    console.error("Available slots error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get available slots",
    });
  }
});

module.exports = router;
