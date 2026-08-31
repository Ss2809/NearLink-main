const User = require("../models/User");
const Business = require("../models/Business");
const Activity = require("../models/Activity");
const path = require("path");
const fs = require("fs");

// Get Authenticated User Profile + Real Stats
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Dynamic stats from real collections in MongoDB
    const [myBusinessesCount, joinedActivitiesCount, createdActivitiesCount, recentActivities] =
      await Promise.all([
        Business.countDocuments({ owner: userId }),
        Activity.countDocuments({ participants: userId }),
        Activity.countDocuments({ createdBy: userId }),
        Activity.find({
          $or: [{ createdBy: userId }, { participants: userId }],
        })
          .sort({ date: -1 })
          .limit(5),
      ]);

    return res.status(200).json({
      success: true,
      user,
      stats: {
        myBusinessesCount,
        joinedActivitiesCount,
        createdActivitiesCount,
      },
      recentActivities,
    });
  } catch (error) {
    console.error("Get Profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Authenticated User Profile Details
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { fullName, email, phone, bio, location, avatar } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must be at least 2 characters long",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If email is being changed, verify uniqueness
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another account",
        });
      }
      user.email = email.trim().toLowerCase();
    }

    user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Upload Profile Photo via Multer
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Clean up previous avatar file from disk if it was a locally uploaded file
    if (user.avatar && user.avatar.includes("/uploads/avatars/")) {
      const oldFilename = user.avatar.split("/uploads/avatars/").pop();
      if (oldFilename) {
        const oldFilePath = path.join(__dirname, "../uploads/avatars", oldFilename);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (e) {
            console.warn("Could not remove old avatar file:", e.message);
          }
        }
      }
    }

    // Construct full URL path
    const photoUrl = `http://localhost:3000/uploads/avatars/${req.file.filename}`;
    user.avatar = photoUrl;
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      avatar: photoUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload Profile Photo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
};
