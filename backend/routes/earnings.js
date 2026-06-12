const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserEarnings,
  withdrawEarnings,
} = require("../controllers/earningsController");

// GET /api/earnings
router.get("/", protect, getUserEarnings);

// POST /api/earnings/withdraw
router.post("/withdraw", protect, withdrawEarnings);

module.exports = router;
