const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  sendReferralRequest,
  respondToReferral,
  getMyReferrals,
  getMyReferralNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAllReferralsAdmin,
} = require("../controllers/referralController");

// User routes (authenticated)
router.post("/send", protect, sendReferralRequest);
router.put("/:id/respond", protect, respondToReferral);
router.get("/mine", protect, getMyReferrals);
router.get("/notifications", protect, getMyReferralNotifications);
router.put("/notifications/read-all", protect, markAllNotificationsRead);
router.put("/notifications/:id/read", protect, markNotificationRead);

// Admin routes
router.get("/admin/all", protect, admin, getAllReferralsAdmin);

module.exports = router;
