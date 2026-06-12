const express = require("express");
const router = express.Router();
const {
  getAvailableVideos,
  startVideoSession,
  updateWatchProgress,
  getWatchHistory,
} = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router.get("/available", getAvailableVideos);
router.get("/history", getWatchHistory);
router.post("/:videoId/start", startVideoSession);
router.put("/session/:sessionId/progress", updateWatchProgress);

module.exports = router;
