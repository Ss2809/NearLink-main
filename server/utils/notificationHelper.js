const Notification = require("../models/notificationModel");

/**
 * Creates a notification in MongoDB and sends it in real-time via Socket.IO
 *
 * @param {Object} io - Socket.IO instance
 * @param {Object} params - Notification parameters
 * @param {string|ObjectId} params.recipient - Target user ID
 * @param {string|ObjectId} [params.sender] - Triggering user ID
 * @param {string} params.type - Enum type from notificationModel
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message body
 * @param {string|ObjectId} [params.activity] - Related Activity ID
 * @param {string|ObjectId} [params.community] - Related Community ID
 */
const createAndSendNotification = async (io, {
  recipient,
  sender,
  type,
  title,
  message,
  activity,
  community,
}) => {
  try {
    if (!recipient || !type || !title || !message) {
      console.warn("createAndSendNotification missing required parameters");
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      activity,
      community,
      isRead: false,
    });

    const populated = await Notification.findById(notification._id)
      .populate("sender", "fullName email avatar")
      .populate("activity", "title")
      .populate("community", "name");

    // Real-time socket emission to recipient's room
    if (io) {
      const recipientRoom = recipient.toString();
      io.to(recipientRoom).emit("notification:new", populated);

      // Compute and emit updated unread count
      const unreadCount = await Notification.countDocuments({
        recipient,
        isRead: false,
      });
      io.to(recipientRoom).emit("notification:unread_count", unreadCount);
    }

    return populated;
  } catch (error) {
    console.error("createAndSendNotification error:", error);
    return null;
  }
};

module.exports = {
  createAndSendNotification,
};
