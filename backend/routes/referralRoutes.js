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
<<<<<<< HEAD
  getUserReferralsByEmail,
=======
  getWithdrawalBonusEvents,
  getReferralsByEmail,
>>>>>>> 4dd9af675a54d7afc8484c7c7e9943e2bfa70913
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
<<<<<<< HEAD
router.get("/admin/user-lookup", protect, admin, getUserReferralsByEmail);
=======
router.get("/admin/withdrawal-bonus-events", protect, admin, getWithdrawalBonusEvents);
router.get("/admin/by-email", protect, admin, getReferralsByEmail);
>>>>>>> 4dd9af675a54d7afc8484c7c7e9943e2bfa70913

module.exports = router;

