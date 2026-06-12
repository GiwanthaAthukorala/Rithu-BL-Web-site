const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pictures",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload only image files"), false);
    }
  },
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post(
  "/profile/upload-picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture
);

router.get("/admin", protect, admin, (req, res) => {
  res.json({ message: "Admin dashboard" });
});

module.exports = router;
