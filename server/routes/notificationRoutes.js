const express = require("express");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const auth = require("../middleware/authmiddleware");

const router = express.Router();

// Get all notifications
router.get("/", auth, getNotifications);

// Get unread notification count
router.get("/unread-count", auth, getUnreadCount);

// Mark all notifications as read
router.put("/mark-all-read", auth, markAllAsRead);

// Mark one notification as read
router.put("/:id/read", auth, markAsRead);

module.exports = router;