const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {
  adminLogin,
  adminLogout,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  createAdminUser,
  getSystemStats,
} = require("../controllers/adminController");

// Admin Auth Routes
router.post("/login", adminLogin);
router.post("/logout", protect, admin, adminLogout);

// Admin Dashboard Routes
router.get("/stats", protect, admin, getAdminStats);
router.get("/submissions", protect, admin, getAllSubmissions);
router.get(
  "/submissions/:platformType/:submissionId",
  protect,
  admin,
  getSubmissionById,
);
router.put("/submissions/status", protect, admin, updateSubmissionStatus);
router.delete(
  "/submissions/:platformType/:submissionId",
  protect,
  admin,
  deleteSubmission,
);

// User Management (Super Admin only)
router.get("/users", protect, admin, getAllUsers);
router.put("/users/:userId/toggle-status", protect, admin, toggleUserStatus);
router.post("/users/create-admin", protect, admin, createAdminUser);
router.get("/system-stats", protect, admin, getSystemStats);

module.exports = router;
