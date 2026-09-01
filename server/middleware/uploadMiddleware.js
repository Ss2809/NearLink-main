const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

const isVercel = Boolean(process.env.VERCEL);
const uploadDir = isVercel
  ? path.join(os.tmpdir(), "uploads", "avatars")
  : path.join(__dirname, "../uploads/avatars");

// Ensure upload directory exists safely
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create upload directory:", err.message);
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (e) {}
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = (req.user?.id || req.user?._id || "user").toString();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `avatar-${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Only JPG, JPEG, PNG, and WebP image files are allowed!"),
      false
    );
  }
};

const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum limit
  },
  fileFilter,
});

module.exports = {
  uploadAvatar,
};
