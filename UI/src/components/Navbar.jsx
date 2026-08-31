import {
  MapPin,
  Home,
  Store,
  Calendar,
  Map,
  MessageCircle,
  Bell,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import Avatar from "./common/Avatar";
import { NOTIFICATION_API_URL, SOCKET_URL } from "../config/api";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await axios.get(
        `${NOTIFICATION_API_URL}/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  };

  const syncUserFromStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error reading stored user:", e);
      }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    syncUserFromStorage();
    fetchUnreadCount();

    const token = localStorage.getItem("token");
    if (token) {
      const socket = io(SOCKET_URL, {
        auth: { token: `Bearer ${token}` },
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("notification:unread_count", (count) => {
        setUnreadCount(count);
      });

      socket.on("notification:new", () => {
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  // Listen for storage events (e.g. avatar update from profile)
  useEffect(() => {
    const handleStorageChange = () => {
      syncUserFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 transition ${
      isActive
        ? "text-green-500 font-semibold"
        : "text-white hover:text-green-500"
    }`;

  return (
    <nav className="bg-[#0F172A] shadow-md sticky top-0 z-40">
      <div className="max-w-[1500px] mx-auto h-16 px-8 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <MapPin
            size={28}
            className="text-green-500 fill-green-500"
          />

          <h1 className="text-3xl font-bold text-white">
            Local
            <span className="text-green-500">Connect</span>
          </h1>
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>
            <Home size={18} />
            Home
          </NavLink>

          <NavLink to="/businesses" className={navLinkClass}>
            <Store size={18} />
            Businesses
          </NavLink>

          <NavLink to="/activities" className={navLinkClass}>
            <Calendar size={18} />
            Activities
          </NavLink>

          <NavLink to="/map" className={navLinkClass}>
            <Map size={18} />
            Map
          </NavLink>

          <NavLink to="/chat" className={navLinkClass}>
            <MessageCircle size={18} />
            Chat
          </NavLink>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          {currentUser && (
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="View Notifications"
            >
              <Bell size={22} />

              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Logged-in User Dropdown with Unified Avatar */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-800 transition"
              >
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.fullName}
                  size="md"
                  border
                />

                <div className="hidden lg:block text-left">
                  <p className="text-white text-sm font-semibold leading-5">
                    {currentUser.fullName}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {open && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl overflow-hidden z-50 border border-slate-100">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition"
                  >
                    <User size={18} className="text-slate-500" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate("/notifications");
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition border-t border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-slate-500" />
                      Notifications
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");

                      if (socketRef.current) {
                        socketRef.current.disconnect();
                      }

                      setCurrentUser(null);
                      setUnreadCount(0);

                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition border-t border-slate-100"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="border border-slate-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;