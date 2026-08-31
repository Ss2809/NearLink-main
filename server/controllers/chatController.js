const Community = require("../models/Community");
const Message = require("../models/Message");
const User = require("../models/User");
const { createAndSendNotification } = require("../utils/notificationHelper");

// Create a new Community
const createCommunity = async (req, res) => {
  try {
    const { name, description, icon, color, pinnedGoal } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Community name is required",
      });
    }

    const userId = req.user.id || req.user._id;

    const community = await Community.create({
      name: name.trim(),
      description: description?.trim() || "",
      icon: icon || "💬",
      color: color || "bg-purple-500",
      pinnedGoal: pinnedGoal?.trim() || "",
      members: [userId],
      createdBy: userId,
    });

    const populatedCommunity = await Community.findById(community._id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Community created successfully",
      community: {
        ...populatedCommunity.toObject(),
        isMember: true,
        memberCount: 1,
      },
    });
  } catch (error) {
    console.error("Create Community error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get all Communities (with membership flag and search)
const getCommunities = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const search = req.query.search || "";

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { pinnedGoal: { $regex: search, $options: "i" } },
      ];
    }

    const communities = await Community.find(filter)
      .populate("createdBy", "fullName email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName email",
        },
      })
      .sort({ updatedAt: -1 });

    const formattedCommunities = communities.map((comm) => {
      const commObj = comm.toObject();
      const isMember = comm.members.some(
        (m) => m.toString() === userId
      );
      return {
        ...commObj,
        isMember,
        memberCount: comm.members.length,
      };
    });

    return res.status(200).json({
      success: true,
      communities: formattedCommunities,
    });
  } catch (error) {
    console.error("Get Communities error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Single Community by ID
const getCommunityById = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const community = await Community.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName email",
        },
      });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMember = community.members.some(
      (m) => (m._id || m).toString() === userId
    );

    return res.status(200).json({
      success: true,
      community: {
        ...community.toObject(),
        isMember,
        memberCount: community.members.length,
      },
    });
  } catch (error) {
    console.error("Get Community by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Join a Community
const joinCommunity = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const alreadyMember = community.members.some(
      (m) => m.toString() === userId
    );

    if (!alreadyMember) {
      community.members.push(userId);
      await community.save();
    }

    const updatedCommunity = await Community.findById(community._id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName email",
        },
      });

    const io = req.app.get("io");
    if (io) {
      io.to(community._id.toString()).emit("community_updated", {
        communityId: community._id,
        memberCount: updatedCommunity.members.length,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Joined community successfully",
      community: {
        ...updatedCommunity.toObject(),
        isMember: true,
        memberCount: updatedCommunity.members.length,
      },
    });
  } catch (error) {
    console.error("Join Community error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Leave a Community
const leaveCommunity = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMember = community.members.some(
      (m) => m.toString() === userId
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this community",
      });
    }

    community.members = community.members.filter(
      (m) => m.toString() !== userId
    );
    await community.save();

    const updatedCommunity = await Community.findById(community._id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName email",
        },
      });

    const io = req.app.get("io");
    if (io) {
      io.to(community._id.toString()).emit("community_updated", {
        communityId: community._id,
        memberCount: updatedCommunity.members.length,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Left community successfully",
      community: {
        ...updatedCommunity.toObject(),
        isMember: false,
        memberCount: updatedCommunity.members.length,
      },
    });
  } catch (error) {
    console.error("Leave Community error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Messages for a Community (Membership Required)
const getMessages = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMember = community.members.some(
      (m) => m.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this community to view messages.",
      });
    }

    const messages = await Message.find({ community: req.params.id })
      .populate("sender", "fullName email avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get Messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Send a Message to Community (Membership Required)
const sendMessage = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const { text, attachments } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text cannot be empty",
      });
    }

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMember = community.members.some(
      (m) => m.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You must join this community to send messages.",
      });
    }

    const message = await Message.create({
      community: community._id,
      sender: userId,
      text: text.trim(),
      attachments: attachments || [],
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "fullName email avatar"
    );

    // Update Community's lastMessage reference and timestamp
    community.lastMessage = message._id;
    await community.save();

    // Broadcast via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(community._id.toString()).emit("new_message", populatedMessage);

      // Notify other members
      const senderUser = await User.findById(userId);
      const snippet = text.trim().length > 60 ? `${text.trim().slice(0, 60)}...` : text.trim();

      for (const memberId of community.members) {
        const mStr = memberId.toString();
        if (mStr !== userId) {
          await createAndSendNotification(io, {
            recipient: mStr,
            sender: userId,
            type: "NEW_MESSAGE",
            title: `New message in ${community.name}`,
            message: `${senderUser?.fullName || "Member"}: ${snippet}`,
            community: community._id,
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Send Message error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete a Message (Sender or Community Admin only)
const deleteMessage = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const community = await Community.findById(message.community);
    const isSender = message.sender.toString() === userId;
    const isCommunityAdmin =
      community && community.createdBy.toString() === userId;

    if (!isSender && !isCommunityAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this message.",
      });
    }

    const communityId = message.community.toString();
    await Message.findByIdAndDelete(message._id);

    // If this was the last message, update community lastMessage
    if (community && community.lastMessage?.toString() === message._id.toString()) {
      const prevMessage = await Message.findOne({ community: community._id }).sort({
        createdAt: -1,
      });
      community.lastMessage = prevMessage ? prevMessage._id : null;
      await community.save();
    }

    // Broadcast deletion via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(communityId).emit("message_deleted", {
        messageId: message._id,
        communityId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      messageId: message._id,
    });
  } catch (error) {
    console.error("Delete Message error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getMessages,
  sendMessage,
  deleteMessage,
};
