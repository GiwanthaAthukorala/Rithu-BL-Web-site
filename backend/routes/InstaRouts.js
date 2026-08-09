const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createInstaSubmission,
  createInstaMultipleSubmissions,
  getUserInstaSubmissions,
  approveInstaSubmission,
  rejectInstaSubmission,
} = require("../controllers/instrgramController");
const uploadFile = require("../middleware/uploadMiddleware");

// User routes
router.post(
  "/",
  protect,
  uploadFile.single("screenshot"),
  createInstaSubmission
);

// Multiple upload route (up to 5 screenshots)
router.post(
  "/multiple",
  protect,
  uploadFile.array("screenshots", 5),
  createInstaMultipleSubmissions
);

router.get("/my-submissions", protect, getUserInstaSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveInstaSubmission);
router.put("/:id/reject", protect, admin, rejectInstaSubmission);

module.exports = router;
