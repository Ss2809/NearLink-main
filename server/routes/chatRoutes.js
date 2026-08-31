const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getMessages,
  sendMessage,
  deleteMessage,
} = require("../controllers/chatController");

// Community endpoints
router.post("/communities", auth, createCommunity);
router.get("/communities", auth, getCommunities);
router.get("/communities/:id", auth, getCommunityById);
router.post("/communities/:id/join", auth, joinCommunity);
router.post("/communities/:id/leave", auth, leaveCommunity);

// Message endpoints
router.get("/communities/:id/messages", auth, getMessages);
router.post("/communities/:id/messages", auth, sendMessage);
router.delete("/messages/:id", auth, deleteMessage);

module.exports = router;
