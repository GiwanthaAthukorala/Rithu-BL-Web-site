const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "submissions",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({
  storage,
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
    files: 10, // Maximum 10 files
  },
});

// Middleware for multiple files
const uploadMultiple = upload.array("screenshots", 10); // Accept up to 10 files with field name "screenshots"

// Middleware for single file (for backward compatibility)
const uploadSingle = upload.single("screenshot");

module.exports = {
  uploadMultiple,
  uploadSingle,
};
