const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createYoutubeSubmission,
  getUserYoutubeSubmissions,
  approveYoutubeSubmission,
  rejectYoutubeSubmission,
} = require("../controllers/youtubeController");
const uploadFile = require("../middleware/uploadMiddleware");

// User routes
router.post(
  "/",
  protect,
  uploadFile.single("screenshot"),
  createYoutubeSubmission
);
router.get("/my-submissions", protect, getUserYoutubeSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveYoutubeSubmission);
router.put("/:id/reject", protect, admin, rejectYoutubeSubmission);

module.exports = router;
