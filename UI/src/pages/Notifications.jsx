import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Bell,
  ArrowLeft,
  Calendar,
  MessageCircle,
  CheckCheck,
  UserPlus,
  UserMinus,
  Edit3,
  Ban,
  UserX,
  Clock,
  Loader2,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import Avatar from "../components/common/Avatar";
import { NOTIFICATION_API_URL, SOCKET_URL } from "../config/api";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.get(NOTIFICATION_API_URL, getHeaders());
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError(
        err.response?.data?.message || "Failed to load your notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  // Connect Socket.IO for live notification updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const socket = io(SOCKET_URL, {
        auth: { token: `Bearer ${token}` },
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("notification:new", (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        toast.info(newNotif.title || "New notification received!");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await axios.put(`${NOTIFICATION_API_URL}/mark-all-read`, {}, getHeaders());

      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
        }))
      );

      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark all as read error:", err);
      toast.error("Failed to mark notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  // Handle single notification click: mark as read and navigate
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await axios.put(
          `${NOTIFICATION_API_URL}/${notification._id}/read`,
          {},
          getHeaders()
        );

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
      }

      // Navigate to destination
      if (notification.type === "NEW_MESSAGE") {
        navigate("/chat");
      } else if (notification.activity?._id || notification.activity) {
        const actId = notification.activity._id || notification.activity;
        navigate(`/activity/${actId}`);
      }
    } catch (err) {
      console.error("Mark notification read error:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatRelativeTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return notifDate.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  // Helper to render type-specific icon and styling
  const getTypeBadge = (type) => {
    switch (type) {
      case "ACTIVITY_CREATE":
        return {
          icon: <PlusCircle size={18} className="text-green-600" />,
          bg: "bg-green-100",
          tag: "Activity Created",
          tagColor: "bg-green-50 text-green-700 border-green-200",
        };
      case "ACTIVITY_JOIN":
        return {
          icon: <UserPlus size={18} className="text-emerald-600" />,
          bg: "bg-emerald-100",
          tag: "Activity Joined",
          tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "ACTIVITY_WITHDRAW":
        return {
          icon: <UserMinus size={18} className="text-amber-600" />,
          bg: "bg-amber-100",
          tag: "Withdrawn",
          tagColor: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "ACTIVITY_UPDATE":
        return {
          icon: <Edit3 size={18} className="text-blue-600" />,
          bg: "bg-blue-100",
          tag: "Activity Updated",
          tagColor: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "ACTIVITY_CANCELLED":
        return {
          icon: <Ban size={18} className="text-red-600" />,
          bg: "bg-red-100",
          tag: "Activity Cancelled",
          tagColor: "bg-red-50 text-red-700 border-red-200",
        };
      case "ACTIVITY_REMOVED":
        return {
          icon: <UserX size={18} className="text-red-600" />,
          bg: "bg-red-100",
          tag: "Removed from Activity",
          tagColor: "bg-red-50 text-red-700 border-red-200",
        };
      case "NEW_MESSAGE":
        return {
          icon: <MessageCircle size={18} className="text-purple-600" />,
          bg: "bg-purple-100",
          tag: "Chat Message",
          tagColor: "bg-purple-50 text-purple-700 border-purple-200",
        };
      default:
        return {
          icon: <Bell size={18} className="text-green-600" />,
          bg: "bg-green-100",
          tag: "Notification",
          tagColor: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200/80 shadow-2xs transition"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up with your updates."}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-2 text-xs font-semibold bg-white hover:bg-slate-50 text-green-700 border border-green-300 px-4 py-2.5 rounded-xl shadow-2xs transition disabled:opacity-50 self-start sm:self-auto"
            >
              <CheckCheck size={16} />
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-2xs">
            <Loader2 size={32} className="animate-spin text-green-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">
              Loading your notifications...
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50 rounded-3xl p-8 text-center border border-red-200">
            <AlertCircle size={32} className="text-red-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-red-900">Unable to load notifications</h3>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Bell size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No notifications yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When someone joins your activities, sends messages, or updates events, you'll see them right here.
            </p>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-3">
            {notifications.map((notification) => {
              const badge = getTypeBadge(notification.type);
              const isUnread = !notification.isRead;

              return (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 md:p-5 rounded-2xl border transition flex items-start gap-4 group ${
                    isUnread
                      ? "bg-green-50/60 border-green-200/90 shadow-xs hover:bg-green-50"
                      : "bg-white border-slate-200/80 hover:bg-slate-50/80"
                  }`}
                >
                  {/* Icon or Sender Avatar */}
                  <div className="relative shrink-0">
                    {notification.sender?.avatar || notification.sender?.fullName ? (
                      <Avatar
                        src={notification.sender?.avatar}
                        name={notification.sender?.fullName || "User"}
                        size="md"
                        className="shadow-2xs"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full ${badge.bg} flex items-center justify-center shadow-2xs group-hover:scale-105 transition`}
                      >
                        {badge.icon}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.tagColor}`}
                        >
                          {badge.tag}
                        </span>
                        <h3
                          className={`text-sm ${
                            isUnread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-800"
                          }`}
                        >
                          {notification.title}
                        </h3>
                      </div>

                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Related Context Preview */}
                    {notification.activity?.title && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-green-700 mt-2">
                        <Calendar size={13} />
                        <span>{notification.activity.title}</span>
                      </div>
                    )}

                    {notification.community?.name && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-purple-700 mt-2">
                        <MessageCircle size={13} />
                        <span>{notification.community.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Unread indicator dot */}
                  {isUnread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-200/80 shrink-0 self-center" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Notifications;