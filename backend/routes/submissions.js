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
const {
  createMultipleSubmissions,
} = require("../controllers/multipleSubmissionController");

// Import upload middleware CORRECTLY
const uploadMiddleware = require("../middleware/uploadMiddleware");

// User routes - Single submission
router.post(
  "/",
  protect,
  uploadMiddleware.single("screenshot"),
  createSubmission,
);

// User routes - Multiple submissions
router.post(
  "/multiple",
  protect,
  uploadMiddleware.array("screenshots", 5),
  createMultipleSubmissions,
);

router.get("/my-submissions", protect, getUserSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveSubmission);
router.put("/:id/reject", protect, admin, rejectSubmission);

module.exports = router;
