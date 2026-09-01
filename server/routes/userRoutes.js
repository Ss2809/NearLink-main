const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const { uploadAvatar } = require("../middleware/uploadMiddleware");
const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
} = require("../controllers/userController");

// Get current logged-in user profile
router.get("/", auth, getProfile);
router.get("/me", auth, getProfile);
router.get("/profile", auth, getProfile);

// Update current logged-in user profile
router.put("/", auth, updateProfile);
router.put("/me", auth, updateProfile);
router.put("/profile", auth, updateProfile);

// Upload profile photo
router.put("/profile/photo", auth, uploadAvatar.single("avatar"), uploadProfilePhoto);
router.post("/profile/photo", auth, uploadAvatar.single("avatar"), uploadProfilePhoto);

module.exports = router;
