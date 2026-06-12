const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createGoogleReviewSubmission,
  getUserGoogleReviewSubmissions,
  approveGoogleReviewSubmission,
  rejectGoogleReviewSubmission,
} = require("../controllers/GoogleReviewControllers");
const uploadFile = require("../middleware/uploadMiddleware");

// User routes
router.post(
  "/",
  protect,
  uploadFile.single("screenshot"),
  createGoogleReviewSubmission
);
router.get("/my-submissions", protect, getUserGoogleReviewSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveGoogleReviewSubmission);
router.put("/:id/reject", protect, admin, rejectGoogleReviewSubmission);

module.exports = router;
