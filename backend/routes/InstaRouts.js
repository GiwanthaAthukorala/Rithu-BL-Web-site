const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createInstaSubmission,
  getUserInstaSubmissions,
  approveInstaSubmission,
  rejectInstaSubmission,
} = require("../controllers/instrgramController");
const uploadFile = require("../middleware/uploadMiddleware");
//const submissionRateLimiter = require("../middleware/rateLimiter");

// User routes
router.post(
  "/",
  protect,
  uploadFile.single("screenshot"),
  createInstaSubmission
);
router.get("/my-submissions", protect, getUserInstaSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveInstaSubmission);
router.put("/:id/reject", protect, admin, rejectInstaSubmission);

module.exports = router;
