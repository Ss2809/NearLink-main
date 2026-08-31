const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const sendEmail = require("../utils/sendEmail");
const Activity = require("../models/Activity");
const User = require("../models/User");
const Notification = require("../models/notificationModel");
const { createAndSendNotification } = require("../utils/notificationHelper");
const auth = require("../middleware/authmiddleware");

// Create Activity
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image,
      date,
      startTime,
      endTime,
      location,
      city,
      latitude,
      longitude,
      maxParticipants,
    } = req.body;

    if (!title || !description || !date || !startTime || !location || !city) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const userId = (req.user.id || req.user._id).toString();

    const activity = await Activity.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "Other",
      image: image || "",
      date,
      startTime,
      endTime: endTime || "",
      location: location.trim(),
      city: city.trim(),
      latitude,
      longitude,
      maxParticipants: Number(maxParticipants) || 0,
      status: "Active",
      createdBy: userId,
      participants: [],
    });

    const populated = await Activity.findById(activity._id)
      .populate("createdBy", "fullName email avatar")
      .populate("participants", "fullName email avatar");

    // Real-time confirmation notification for creator
    const io = req.app.get("io");
    await createAndSendNotification(io, {
      recipient: userId,
      sender: userId,
      type: "ACTIVITY_CREATE",
      title: "Activity Created",
      message: `You created "${activity.title}".`,
      activity: activity._id,
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      activity: populated,
    });
  } catch (error) {
    console.error("Create Activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Get All Activities
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const search = req.query.search || "";
    const category = req.query.category || "All";

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    if (category !== "All") {
      filter.category = category;
    }

    const totalActivities = await Activity.countDocuments(filter);

    const activities = await Activity.find(filter)
      .populate("createdBy", "fullName email avatar")
      .populate("participants", "fullName email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalActivities / limit),
      totalActivities,
      activities,
    });
  } catch (error) {
    console.error("Get Activities error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Get Single Activity
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const activity = await Activity.findById(req.params.id)
      .populate("createdBy", "fullName email avatar")
      .populate("participants", "fullName email avatar");

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error("Get Single Activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Edit Activity (Creator Only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const userId = (req.user.id || req.user._id).toString();

    // Verify creator authorization
    if (activity.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the activity creator can edit this activity",
      });
    }

    if (activity.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit a cancelled activity",
      });
    }

    const {
      title,
      description,
      category,
      image,
      date,
      startTime,
      endTime,
      location,
      city,
      latitude,
      longitude,
      maxParticipants,
    } = req.body;

    const newCapacity = Number(maxParticipants) || 0;
    const currentParticipantCount = activity.participants.length;

    // Capacity validation: cannot reduce capacity below existing participants
    if (newCapacity > 0 && newCapacity < currentParticipantCount) {
      return res.status(400).json({
        success: false,
        message: `Maximum capacity cannot be less than the current participant count (${currentParticipantCount})`,
      });
    }

    // Update fields
    if (title) activity.title = title.trim();
    if (description) activity.description = description.trim();
    if (category) activity.category = category;
    if (image !== undefined) activity.image = image;
    if (date) activity.date = date;
    if (startTime) activity.startTime = startTime;
    if (endTime !== undefined) activity.endTime = endTime;
    if (location) activity.location = location.trim();
    if (city) activity.city = city.trim();
    if (latitude !== undefined) activity.latitude = latitude;
    if (longitude !== undefined) activity.longitude = longitude;
    activity.maxParticipants = newCapacity;

    await activity.save();

    const updatedActivity = await Activity.findById(activity._id)
      .populate("createdBy", "fullName email avatar")
      .populate("participants", "fullName email avatar");

    // Real-time notification to all participants
    const io = req.app.get("io");
    for (const participantId of activity.participants) {
      const pidStr = (participantId._id || participantId).toString();
      if (pidStr !== userId) {
        await createAndSendNotification(io, {
          recipient: pidStr,
          sender: userId,
          type: "ACTIVITY_UPDATE",
          title: "Activity Details Updated",
          message: `The organizer updated details for "${activity.title}".`,
          activity: activity._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Edit Activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Cancel Activity (Creator Only)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const userId = (req.user.id || req.user._id).toString();

    // Verify creator authorization
    if (activity.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the activity creator can cancel this activity",
      });
    }

    if (activity.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Activity is already cancelled",
      });
    }

    activity.status = "Cancelled";
    await activity.save();

    const updatedActivity = await Activity.findById(activity._id)
      .populate("createdBy", "fullName email avatar")
      .populate("participants", "fullName email avatar");

    // Real-time notification to all participants
    const io = req.app.get("io");
    for (const participantId of activity.participants) {
      const pidStr = (participantId._id || participantId).toString();
      if (pidStr !== userId) {
        await createAndSendNotification(io, {
          recipient: pidStr,
          sender: userId,
          type: "ACTIVITY_CANCELLED",
          title: "Activity Cancelled",
          message: `The activity "${activity.title}" has been cancelled by the organizer.`,
          activity: activity._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Activity cancelled successfully",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Cancel Activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Delete Activity (Creator Only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const userId = (req.user.id || req.user._id).toString();

    // Verify creator authorization
    if (activity.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the activity creator can delete this activity",
      });
    }

    // Real-time notification to all participants before delete
    const io = req.app.get("io");
    for (const participantId of activity.participants) {
      const pidStr = (participantId._id || participantId).toString();
      if (pidStr !== userId) {
        await createAndSendNotification(io, {
          recipient: pidStr,
          sender: userId,
          type: "ACTIVITY_CANCELLED",
          title: "Activity Cancelled",
          message: `The activity "${activity.title}" was cancelled and removed by the organizer.`,
        });
      }
    }

    await Activity.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Delete Activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Remove a Participant (Creator Only)
const removeParticipantHandler = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(targetUserId)
    ) {
      return res.status(404).json({
        success: false,
        message: "Activity or user not found",
      });
    }

    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const currentUserId = (req.user.id || req.user._id).toString();

    // Verify creator authorization
    if (activity.createdBy.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Only the activity creator can remove participants",
      });
    }

    // Check if target user is enrolled
    const isEnrolled = activity.participants.some(
      (p) => p.toString() === targetUserId.toString()
    );

    if (!isEnrolled) {
      return res.status(400).json({
        success: false,
        message: "User is not a participant of this activity",
      });
    }

    // Remove user
    activity.participants = activity.participants.filter(
      (p) => p.toString() !== targetUserId.toString()
    );
    await activity.save();

    const updatedActivity = await Activity.findById(activity._id)
      .populate("createdBy", "fullName email avatar")
      .populate("participants", "fullName email avatar");

    // Real-time notification to removed participant
    const io = req.app.get("io");
    await createAndSendNotification(io, {
      recipient: targetUserId,
      sender: currentUserId,
      type: "ACTIVITY_REMOVED",
      title: "Removed from Activity",
      message: `You were removed from the activity "${activity.title}" by the organizer.`,
      activity: activity._id,
    });

    return res.status(200).json({
      success: true,
      message: "Participant removed successfully",
      participantsCount: activity.participants.length,
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Remove Participant error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

router.delete("/:id/participants/:userId", auth, removeParticipantHandler);
router.post("/:id/remove-participant/:userId", auth, removeParticipantHandler);

// Join Activity
router.post("/:id/join", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (activity.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "This activity has been cancelled and cannot be joined",
      });
    }

    const userId = (req.user.id || req.user._id).toString();

    // Already joined
    const alreadyJoined = activity.participants.some(
      (participant) => participant.toString() === userId
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You already joined this activity",
      });
    }

    // Activity full
    if (
      activity.maxParticipants > 0 &&
      activity.participants.length >= activity.maxParticipants
    ) {
      return res.status(400).json({
        success: false,
        message: "Activity is already full",
      });
    }

    // Add user
    activity.participants.push(userId);
    await activity.save();

    const updatedActivity = await Activity.findById(activity._id)
      .populate("createdBy", "fullName email avatar")
      .populate("participants", "fullName email avatar");

    const user = await User.findById(userId);
    const io = req.app.get("io");

    // Notification to user
    await createAndSendNotification(io, {
      recipient: userId,
      sender: userId,
      type: "ACTIVITY_JOIN",
      title: "Activity Joined",
      message: `You successfully joined "${activity.title}".`,
      activity: activity._id,
    });

    // Notification to creator
    if (activity.createdBy && activity.createdBy.toString() !== userId) {
      await createAndSendNotification(io, {
        recipient: activity.createdBy,
        sender: userId,
        type: "ACTIVITY_JOIN",
        title: `${user?.fullName || "Someone"} joined your activity`,
        message: `${user?.fullName || "A member"} joined "${activity.title}".`,
        activity: activity._id,
      });
    }

    // Email is optional and must never block the join flow.
    if (user?.email) {
      void sendEmail({
        to: user.email,
        subject: "Activity Join Confirmation - LocalConnect",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #16a34a;">
              Hi ${user.fullName}, 👋
            </h2>

            <p>
              You have successfully joined the activity:
            </p>

            <h3 style="color: #16a34a;">
              ${activity.title}
            </h3>

            <hr />

            <p>
              <strong>📅 Date:</strong>
              ${new Date(activity.date).toLocaleDateString()}
            </p>

            <p>
              <strong>🕒 Time:</strong>
              ${activity.startTime}
              ${activity.endTime ? ` - ${activity.endTime}` : ""}
            </p>

            <p>
              <strong>📍 Location:</strong>
              ${activity.location}, ${activity.city}
            </p>

            <p>
              We look forward to seeing you there!
            </p>

            <p style="color: #666; margin-top: 30px;">
              — LocalConnect Team
            </p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Activity joined successfully",
      participantsCount: activity.participants.length,
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Join Activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Withdraw from Activity
router.post("/:id/withdraw", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const userId = (req.user.id || req.user._id).toString();

    // Check user joined or not
    const joined = activity.participants.some(
      (participant) => participant.toString() === userId
    );

    if (!joined) {
      return res.status(400).json({
        success: false,
        message: "You have not joined this activity",
      });
    }

    // Remove user from participants
    activity.participants = activity.participants.filter(
      (participant) => participant.toString() !== userId
    );

    await activity.save();

    const updatedActivity = await Activity.findById(activity._id)
      .populate("createdBy", "fullName email avatar")
      .populate("participants", "fullName email avatar");

    const user = await User.findById(userId);
    const io = req.app.get("io");

    // Notify creator about participant withdrawal
    if (activity.createdBy && activity.createdBy.toString() !== userId) {
      await createAndSendNotification(io, {
        recipient: activity.createdBy,
        sender: userId,
        type: "ACTIVITY_WITHDRAW",
        title: "Participant Withdrawn",
        message: `${user?.fullName || "A participant"} has withdrawn from your activity "${activity.title}".`,
        activity: activity._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully withdrawn from activity",
      participantsCount: activity.participants.length,
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Withdraw Activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;