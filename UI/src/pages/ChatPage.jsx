import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Users,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Trash2,
  LogOut,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import CreateCommunityModal from "../components/chat/CreateCommunityModal";
import Avatar from "../components/common/Avatar";
import EmojiPickerPopover from "../components/chat/EmojiPickerPopover";
import { CHAT_API_URL, SOCKET_URL as SOCKET_SERVER_URL } from "../config/api";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedCommunityRef = useRef(selectedCommunity);

  // Sync ref with state
  useEffect(() => {
    selectedCommunityRef.current = selectedCommunity;
  }, [selectedCommunity]);

  // Auth Header helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Load Current User
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (err) {
        console.error("Error reading stored user:", err);
      }
    }
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected successfully:", socket.id);
      // If a community was selected, join its room
      if (selectedCommunityRef.current?._id && selectedCommunityRef.current.isMember) {
        socket.emit("join_room", selectedCommunityRef.current._id);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket.IO] Connection error:", error.message);
    });

    // Real-time Incoming Message Handler
    socket.on("new_message", (message) => {
      const activeComm = selectedCommunityRef.current;
      if (activeComm && activeComm._id === message.community) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update last message in communities list
      setCommunities((prev) =>
        prev.map((comm) =>
          comm._id === message.community
            ? {
                ...comm,
                lastMessage: message,
                updatedAt: message.createdAt,
              }
            : comm
        )
      );
    });

    // Real-time Message Deleted Handler
    socket.on("message_deleted", ({ messageId, communityId }) => {
      const activeComm = selectedCommunityRef.current;
      if (activeComm && activeComm._id === communityId) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    });

    // Real-time Community Update (e.g. member joined/left)
    socket.on("community_updated", ({ communityId, memberCount }) => {
      setCommunities((prev) =>
        prev.map((c) =>
          c._id === communityId
            ? { ...c, memberCount, members: { length: memberCount } }
            : c
        )
      );
      if (selectedCommunityRef.current?._id === communityId) {
        setSelectedCommunity((prev) =>
          prev ? { ...prev, memberCount } : prev
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch Communities
  const fetchCommunities = async (selectId = null) => {
    try {
      setLoadingCommunities(true);
      const res = await axios.get(
        `${CHAT_API_URL}/communities`,
        getAuthHeaders()
      );
      const fetched = res.data.communities || [];
      setCommunities(fetched);

      if (fetched.length > 0) {
        if (selectId) {
          const target = fetched.find((c) => c._id === selectId) || fetched[0];
          setSelectedCommunity(target);
        } else if (!selectedCommunity) {
          setSelectedCommunity(fetched[0]);
        } else {
          // Preserve currently selected community with fresh data
          const updatedSelected = fetched.find(
            (c) => c._id === selectedCommunity._id
          );
          if (updatedSelected) {
            setSelectedCommunity(updatedSelected);
          }
        }
      }
    } catch (error) {
      console.error("Fetch communities error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load communities"
      );
    } finally {
      setLoadingCommunities(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  // When Selected Community changes, join its socket room and fetch messages
  useEffect(() => {
    if (!selectedCommunity) {
      setMessages([]);
      return;
    }

    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("join_room", selectedCommunity._id);
    }

    // Only fetch messages if the user is a member
    if (selectedCommunity.isMember) {
      fetchMessages(selectedCommunity._id);
    } else {
      setMessages([]);
    }

    return () => {
      if (socket && socket.connected && selectedCommunity._id) {
        socket.emit("leave_room", selectedCommunity._id);
      }
    };
  }, [selectedCommunity?._id, selectedCommunity?.isMember]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages]);

  // Fetch Messages for active community
  const fetchMessages = async (communityId) => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(
        `${CHAT_API_URL}/communities/${communityId}/messages`,
        getAuthHeaders()
      );
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Fetch messages error:", error);
      if (error.response?.status !== 403) {
        toast.error(
          error.response?.data?.message || "Failed to load messages"
        );
      }
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Join Community
  const handleJoinCommunity = async (community, e) => {
    if (e) e.stopPropagation();
    try {
      setJoining(true);
      const res = await axios.post(
        `${CHAT_API_URL}/communities/${community._id}/join`,
        {},
        getAuthHeaders()
      );

      const updated = res.data.community;
      toast.success(res.data.message || `Joined ${community.name}`);

      setCommunities((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );

      setSelectedCommunity(updated);

      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("join_room", updated._id);
      }
    } catch (error) {
      console.error("Join community error:", error);
      toast.error(error.response?.data?.message || "Failed to join community");
    } finally {
      setJoining(false);
    }
  };

  // Leave Community
  const handleLeaveCommunity = async () => {
    if (!selectedCommunity) return;
    try {
      setShowOptionsDropdown(false);
      const res = await axios.post(
        `${CHAT_API_URL}/communities/${selectedCommunity._id}/leave`,
        {},
        getAuthHeaders()
      );

      const updated = res.data.community;
      toast.info(res.data.message || `Left ${selectedCommunity.name}`);

      setCommunities((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );

      setSelectedCommunity(updated);

      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("leave_room", updated._id);
      }
    } catch (error) {
      console.error("Leave community error:", error);
      toast.error(error.response?.data?.message || "Failed to leave community");
    }
  };

  // Send Message (Supports both real-time Socket and REST fallback)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCommunity || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    if (!selectedCommunity.isMember) {
      toast.warn("Please join the community first to send messages!");
      return;
    }

    try {
      setSending(true);

      if (socketRef.current && socketRef.current.connected) {
        // Send via Socket.IO
        socketRef.current.emit(
          "send_message",
          {
            communityId: selectedCommunity._id,
            text: messageText,
          },
          (response) => {
            if (response && !response.success) {
              toast.error(response.message || "Failed to deliver message");
            }
          }
        );
      } else {
        // Fallback to REST API if socket disconnected
        const res = await axios.post(
          `${CHAT_API_URL}/communities/${selectedCommunity._id}/messages`,
          { text: messageText },
          getAuthHeaders()
        );
        const savedMessage = res.data.message;
        setMessages((prev) => [...prev, savedMessage]);
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `${CHAT_API_URL}/messages/${messageId}`,
        getAuthHeaders()
      );
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success("Message deleted");
    } catch (error) {
      console.error("Delete message error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete message"
      );
    }
  };

  // Format message timestamp
  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter communities by search
  const filteredCommunities = communities.filter((comm) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      comm.name?.toLowerCase().includes(term) ||
      comm.description?.toLowerCase().includes(term) ||
      comm.pinnedGoal?.toLowerCase().includes(term)
    );
  });

  const currentUserId = currentUser?._id || currentUser?.id;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)] bg-slate-50">
        {/* ======================================================== */}
        {/* LEFT SIDEBAR - COMMUNITIES LIST */}
        {/* ======================================================== */}
        <aside className="flex w-[350px] shrink-0 flex-col border-r border-slate-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Communities</h2>
              <p className="text-xs text-slate-400">Neighborhood chats & groups</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition"
              title="Create Community"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Search Box */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Community Items List */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5">
            {loadingCommunities ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 size={26} className="animate-spin text-purple-600 mb-2" />
                <p className="text-sm">Loading communities...</p>
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <p className="text-sm font-medium">No communities found</p>
                <p className="text-xs mt-1 text-slate-400">
                  {searchTerm
                    ? "Try a different search term"
                    : "Create the first neighborhood community!"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-purple-700 transition"
                  >
                    <Plus size={16} />
                    Create Community
                  </button>
                )}
              </div>
            ) : (
              filteredCommunities.map((community) => {
                const isSelected = selectedCommunity?._id === community._id;
                const memberCount =
                  community.memberCount ?? community.members?.length ?? 0;
                const lastMsgText =
                  community.lastMessage?.text ||
                  community.description ||
                  "No messages yet";

                return (
                  <button
                    key={community._id}
                    onClick={() => setSelectedCommunity(community)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition border ${
                      isSelected
                        ? "bg-purple-50/80 border-purple-200 shadow-xs"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl text-white ${
                        community.color || "bg-purple-500"
                      }`}
                    >
                      {community.icon || "💬"}
                    </div>

                    {/* Community Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="truncate text-sm font-bold text-slate-800">
                            {community.name}
                          </h3>
                        </div>

                        <p className="truncate text-xs text-slate-500 mt-0.5">
                          {lastMsgText}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Users size={12} />
                            {memberCount} {memberCount === 1 ? "member" : "members"}
                          </span>

                          {community.isMember && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                              <CheckCircle2 size={10} /> Joined
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Join Button if not a member */}
                      {!community.isMember && (
                        <button
                          onClick={(e) => handleJoinCommunity(community, e)}
                          disabled={joining}
                          className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition disabled:opacity-50"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Create Button */}
          <div className="border-t border-slate-200 p-3 bg-slate-50/50">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition shadow-2xs"
            >
              <Plus size={18} />
              Create Community
            </button>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT MAIN AREA - CHAT WINDOW */}
        {/* ======================================================== */}
        <main className="flex min-w-0 flex-1 flex-col bg-white">
          {selectedCommunity ? (
            <>
              {/* Chat Header */}
              <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-white shadow-2xs z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white ${
                      selectedCommunity.color || "bg-purple-500"
                    }`}
                  >
                    {selectedCommunity.icon || "💬"}
                  </div>

                  <div>
                    <h1 className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                      {selectedCommunity.name}
                      {selectedCommunity.isMember && (
                        <span className="text-xs bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded-full">
                          Member
                        </span>
                      )}
                    </h1>

                    <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Users size={14} />
                      {selectedCommunity.memberCount ??
                        selectedCommunity.members?.length ??
                        0}{" "}
                      members
                      {selectedCommunity.description && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="truncate max-w-md">
                            {selectedCommunity.description}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Header Action Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {showOptionsDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-xl border border-slate-100 z-50">
                      {selectedCommunity.isMember ? (
                        <button
                          onClick={handleLeaveCommunity}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut size={15} />
                          Leave Community
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinCommunity(selectedCommunity)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50 transition"
                        >
                          <Sparkles size={15} />
                          Join Community
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </header>

              {/* Pinned Goal Banner */}
              {selectedCommunity.pinnedGoal && (
                <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50/70 px-4 py-2.5">
                  <span className="text-base">📌</span>
                  <p className="text-xs font-medium text-purple-800">
                    <strong className="font-semibold">Goal: </strong>
                    {selectedCommunity.pinnedGoal}
                  </p>
                </div>
              )}

              {/* Message List */}
              <section className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Non-member Banner */}
                {!selectedCommunity.isMember && (
                  <div className="my-8 text-center rounded-2xl border border-dashed border-purple-300 bg-purple-50/50 p-8 max-w-lg mx-auto">
                    <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-3">
                      <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Join {selectedCommunity.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      Become a member to read conversations, participate in
                      community discussions, and meet your neighbors.
                    </p>
                    <button
                      onClick={() => handleJoinCommunity(selectedCommunity)}
                      disabled={joining}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      <Sparkles size={16} />
                      {joining ? "Joining..." : "Join Community Now"}
                    </button>
                  </div>
                )}

                {/* Loading Messages */}
                {selectedCommunity.isMember && loadingMessages && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 size={28} className="animate-spin text-purple-600 mb-2" />
                    <p className="text-sm">Loading messages...</p>
                  </div>
                )}

                {/* Empty State */}
                {selectedCommunity.isMember &&
                  !loadingMessages &&
                  messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-3">
                        {selectedCommunity.icon || "💬"}
                      </div>
                      <h3 className="text-base font-bold text-slate-700">
                        No messages yet
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Be the first to say hello in {selectedCommunity.name}!
                      </p>
                    </div>
                  )}

                {/* Messages Feed */}
                {selectedCommunity.isMember &&
                  !loadingMessages &&
                  messages.map((message) => {
                    const senderId =
                      message.sender?._id || message.sender?.id || message.sender;
                    const isOwn =
                      currentUserId &&
                      senderId &&
                      senderId.toString() === currentUserId.toString();
                    const senderName =
                      message.sender?.fullName ||
                      message.sender?.email ||
                      "Neighbor";
                    const avatarLetter = (senderName[0] || "U").toUpperCase();

                    return (
                      <div
                        key={message._id}
                        className={`group flex items-end gap-2 ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Other's Avatar */}
                        {!isOwn && (
                          <Avatar
                            src={message.sender?.avatar}
                            name={senderName}
                            size="sm"
                            className="mb-1 shrink-0 shadow-2xs"
                          />
                        )}

                        {/* Delete button on hover for own message */}
                        {isOwn && (
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition p-1 mb-1"
                            title="Delete message"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs ${
                            isOwn
                              ? "rounded-br-xs bg-purple-600 text-white"
                              : "rounded-bl-xs bg-slate-100 text-slate-800"
                          }`}
                        >
                          {!isOwn && (
                            <p className="mb-0.5 text-xs font-bold text-purple-700">
                              {senderName}
                            </p>
                          )}

                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.text}
                          </p>

                          <p
                            className={`mt-1 text-right text-[10px] ${
                              isOwn ? "text-purple-200" : "text-slate-400"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                <div ref={messagesEndRef} />
              </section>

              {/* Message Input Box */}
              <div className="border-t border-slate-200 p-4 bg-white relative">
                {showEmojiPicker && (
                  <EmojiPickerPopover
                    onSelectEmoji={(emoji) => {
                      setNewMessage((prev) => prev + emoji);
                    }}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}

                <div
                  className={`flex items-center gap-2 rounded-2xl bg-slate-100 p-1.5 transition ${
                    !selectedCommunity.isMember
                      ? "opacity-60 pointer-events-none"
                      : "focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                    title="Add attachment"
                  >
                    <Paperclip size={18} />
                  </button>

                  <input
                    type="text"
                    placeholder={
                      selectedCommunity.isMember
                        ? `Message #${selectedCommunity.name}...`
                        : "Join this community to start chatting..."
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={!selectedCommunity.isMember || sending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none text-slate-800 placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={`rounded-xl p-2 transition ${
                      showEmojiPicker
                        ? "bg-purple-100 text-purple-700 shadow-2xs"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                    }`}
                    title="Choose Emoji"
                  >
                    <Smile size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setShowEmojiPicker(false);
                      handleSendMessage();
                    }}
                    disabled={!newMessage.trim() || !selectedCommunity.isMember || sending}
                    className="flex items-center justify-center rounded-xl bg-purple-600 p-2.5 text-white shadow-xs transition hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Community Selected State */
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400 p-6">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 flex items-center justify-center text-3xl mb-4 text-purple-600">
                💬
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Welcome to NearLink Communities
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-md text-center">
                Select a community from the sidebar to view discussions, or
                create a new community for your neighborhood.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-purple-700 transition"
              >
                <Plus size={18} />
                Create New Community
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <CreateCommunityModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newComm) => {
            fetchCommunities(newComm._id);
          }}
        />
      )}
    </div>
  );
}
