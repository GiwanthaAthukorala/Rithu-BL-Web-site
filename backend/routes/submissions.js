// routes/submissions.js
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

// User routes - changed to upload.array for multiple files
router.post("/", protect, uploadFile.array("screenshots", 6), createSubmission);
router.get("/my-submissions", protect, getUserSubmissions);

// Admin routes remain the same
router.put("/:id/approve", protect, admin, approveSubmission);
router.put("/:id/reject", protect, admin, rejectSubmission);

module.exports = router;
