const Notification = require("../models/notificationModel");

// Get all notifications of logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .populate("sender", "fullName email avatar")
      .populate("activity", "title image date startTime location city")
      .populate("community", "name icon color")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Unread count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
};

// Mark one notification as read (Strictly recipient-authenticated)
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: userId,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    )
      .populate("sender", "fullName email avatar")
      .populate("activity", "title")
      .populate("community", "name");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    // Sync updated count via Socket.IO
    const io = req.app.get("io");
    if (io) {
      const remainingUnread = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });
      io.to(userId.toString()).emit("notification:unread_count", remainingUnread);
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

// Mark all notifications as read (Strictly recipient-authenticated)
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    // Sync 0 unread count via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(userId.toString()).emit("notification:unread_count", 0);
    }

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};