const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addFacebookAccount,
  getUserFacebookAccounts,
  updateFacebookAccount,
  deleteFacebookAccount,
  toggleAccountStatus,
  verifyFacebookAccount,
  getAccountUsage,
} = require("../controllers/facebookAccountController");

// All routes require authentication
router.use(protect);

// CRUD operations
router.post("/", addFacebookAccount);
router.get("/", getUserFacebookAccounts);
router.put("/:accountId", updateFacebookAccount);
router.delete("/:accountId", deleteFacebookAccount);
router.patch("/:accountId/toggle-status", toggleAccountStatus);
router.post("/:accountId/verify", verifyFacebookAccount);
router.get("/:accountId/usage", getAccountUsage);

// Get available slots count - FIXED version
router.get("/available-slots", async (req, res) => {
  try {
    const user = req.user;
    const availableSlots = 20 - (user.facebookAccounts?.length || 0);
    res.json({
      success: true,
      availableSlots,
      total: 20,
      used: user.facebookAccounts?.length || 0,
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
