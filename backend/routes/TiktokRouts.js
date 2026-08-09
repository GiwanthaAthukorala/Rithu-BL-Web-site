const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createTiktokSubmission,
  createTiktokMultipleSubmissions,
  getUserTiktokSubmissions,
  approveTitokSubmission,
  rejectTiktokSubmission,
} = require("../controllers/tiktokControllers");
const uploadFile = require("../middleware/uploadMiddleware");

// User routes — single upload
router.post(
  "/",
  protect,
  uploadFile.single("screenshot"),
  createTiktokSubmission
);

// Multiple upload route (up to 5 screenshots)
router.post(
  "/multiple",
  protect,
  uploadFile.array("screenshots", 5),
  createTiktokMultipleSubmissions
);

router.get("/my-submissions", protect, getUserTiktokSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveTitokSubmission);
router.put("/:id/reject", protect, admin, rejectTiktokSubmission);

module.exports = router;
