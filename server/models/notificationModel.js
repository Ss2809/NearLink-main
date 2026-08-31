// models/notificationModel.js

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: [
        "ACTIVITY_CREATE",
        "ACTIVITY_JOIN",
        "ACTIVITY_WITHDRAW",
        "ACTIVITY_UPDATE",
        "ACTIVITY_CANCELLED",
        "ACTIVITY_REMOVED",
        "ACTIVITY_REMINDER",
        "NEW_MESSAGE",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
    },

    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);