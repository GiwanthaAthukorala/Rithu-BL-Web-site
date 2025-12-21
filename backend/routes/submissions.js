const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createSubmission,
  getUserSubmissions,
  approveSubmission,
  rejectSubmission,
} = require("../controllers/submissionController");
const uploadFile = require("../middleware/uploadMiddleware");
//const submissionRateLimiter = require("../middleware/rateLimiter");

// User routes
router.post("/", protect, uploadFile.single("screenshot"), createSubmission);
router.get("/my-submissions", protect, getUserSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveSubmission);
router.put("/:id/reject", protect, admin, rejectSubmission);

module.exports = router;
