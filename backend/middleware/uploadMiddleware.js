// middleware/uploadMiddleware.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "submissions",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1920, height: 1080, crop: "limit" }],
  },
});

// Create multer instance with array support
const uploadFile = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG/JPG/PNG images allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 6, // Maximum 6 files
  },
});

module.exports = uploadFile;
