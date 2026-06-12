const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createFbReviewSubmission,
  getUserReviewSubmissions,
  approveReviewSubmission,
  rejectReviewSubmission,
} = require("../controllers/FbReviewController");
const uploadFile = require("../middleware/uploadMiddleware");

// User routes
router.post(
  "/",
  protect,
  uploadFile.single("screenshot"),
  createFbReviewSubmission
);
router.get("/my-submissions", protect, getUserReviewSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveReviewSubmission);
router.put("/:id/reject", protect, admin, rejectReviewSubmission);

module.exports = router;
