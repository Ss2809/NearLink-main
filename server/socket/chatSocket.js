const jwt = require("jsonwebtoken");
const Community = require("../models/Community");
const Message = require("../models/Message");
const User = require("../models/User");
const { createAndSendNotification } = require("../utils/notificationHelper");

const initChatSocket = (io) => {
  // Authentication handshake middleware
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        ...decoded,
        id: decoded.id || decoded._id,
        _id: decoded.id || decoded._id,
      };

      return next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket.IO] User connected: ${userId} (${socket.id})`);

    // Automatically join user's own private notification room
    socket.join(userId.toString());

    // Join a community conversation room
    socket.on("join_room", async (data, callback) => {
      try {
        const communityId = typeof data === "string" ? data : data?.communityId;
        if (!communityId) {
          if (callback) callback({ success: false, message: "Missing communityId" });
          return;
        }

        const community = await Community.findById(communityId);
        if (!community) {
          socket.emit("socket_error", { message: "Community not found" });
          if (callback) callback({ success: false, message: "Community not found" });
          return;
        }

        const isMember = community.members.some(
          (m) => m.toString() === userId.toString()
        );

        if (!isMember) {
          socket.emit("socket_error", {
            message: "You must join this community before entering the chat room",
          });
          if (callback)
            callback({
              success: false,
              message: "Not a member of this community",
            });
          return;
        }

        socket.join(communityId.toString());
        console.log(`[Socket.IO] User ${userId} joined room ${communityId}`);

        if (callback) callback({ success: true, communityId });
      } catch (err) {
        console.error("Socket join_room error:", err);
        socket.emit("socket_error", { message: "Failed to join room" });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // Leave a community conversation room
    socket.on("leave_room", (data, callback) => {
      try {
        const communityId = typeof data === "string" ? data : data?.communityId;
        if (communityId) {
          socket.leave(communityId.toString());
          console.log(`[Socket.IO] User ${userId} left room ${communityId}`);
        }
        if (callback) callback({ success: true, communityId });
      } catch (err) {
        console.error("Socket leave_room error:", err);
      }
    });

    // Real-time message sending via socket
    socket.on("send_message", async (data, callback) => {
      try {
        const { communityId, text, attachments } = data || {};

        if (!communityId || !text || !text.trim()) {
          socket.emit("socket_error", {
            message: "Community ID and non-empty text are required",
          });
          if (callback)
            callback({ success: false, message: "Invalid message payload" });
          return;
        }

        const community = await Community.findById(communityId);
        if (!community) {
          socket.emit("socket_error", { message: "Community not found" });
          if (callback) callback({ success: false, message: "Community not found" });
          return;
        }

        const isMember = community.members.some(
          (m) => m.toString() === userId.toString()
        );

        if (!isMember) {
          socket.emit("socket_error", {
            message: "You are not a member of this community",
          });
          if (callback)
            callback({ success: false, message: "Not a member of this community" });
          return;
        }

        // Persist message in MongoDB
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

        // Update Community's lastMessage
        community.lastMessage = message._id;
        await community.save();

        // Broadcast message to all active participants in this community room
        io.to(communityId.toString()).emit("new_message", populatedMessage);

        // Create and emit notification to offline / non-active members
        const senderUser = await User.findById(userId);
        const snippet = text.trim().length > 60 ? `${text.trim().slice(0, 60)}...` : text.trim();

        for (const memberId of community.members) {
          const mStr = memberId.toString();
          if (mStr !== userId.toString()) {
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

        if (callback) callback({ success: true, message: populatedMessage });
      } catch (err) {
        console.error("Socket send_message error:", err);
        socket.emit("socket_error", { message: "Failed to send message" });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // Typing indicators
    socket.on("typing", (data) => {
      const { communityId, userName } = data || {};
      if (communityId) {
        socket.to(communityId.toString()).emit("user_typing", {
          userId,
          userName,
          communityId,
        });
      }
    });

    socket.on("stop_typing", (data) => {
      const { communityId } = data || {};
      if (communityId) {
        socket.to(communityId.toString()).emit("user_stop_typing", {
          userId,
          communityId,
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] User disconnected: ${userId} (${reason})`);
    });
  });
};

module.exports = initChatSocket;
