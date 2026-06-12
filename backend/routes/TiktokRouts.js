const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createTiktokSubmission,
  getUserTiktokSubmissions,
  approveTitokSubmission,
  rejectTiktokSubmission,
} = require("../controllers/tiktokControllers");
const uploadFile = require("../middleware/uploadMiddleware");
//const submissionRateLimiter = require("../middleware/rateLimiter");

// User routes
router.post(
  "/",
  protect,
  uploadFile.single("screenshot"),
  createTiktokSubmission
);
router.get("/my-submissions", protect, getUserTiktokSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveTitokSubmission);
router.put("/:id/reject", protect, admin, rejectTiktokSubmission);

module.exports = router;
