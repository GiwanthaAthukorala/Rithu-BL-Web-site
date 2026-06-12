const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createFbCommentSubmission,
  getUserCommentSubmissions,
  approveCommentSubmission,
  rejectCommentSubmission,
} = require("../controllers/FbCommentController");
const uploadFile = require("../middleware/uploadMiddleware");

// User routes
router.post(
  "/",
  protect,
  uploadFile.single("screenshot"),
  createFbCommentSubmission
);
router.get("/my-submissions", protect, getUserCommentSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveCommentSubmission);
router.put("/:id/reject", protect, admin, rejectCommentSubmission);

module.exports = router;
