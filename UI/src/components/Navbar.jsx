import {
  MapPin,
  Home,
  Store,
  Calendar,
  Map,
  MessageCircle,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setCurrentUser(user);
    }
  }, []);
  const initials = currentUser?.fullName
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 transition ${
      isActive
        ? "text-green-500 font-semibold"
        : "text-white hover:text-green-500"
    }`;

  return (
    <nav className="bg-[#0F172A] shadow-md">
      <div className="max-w-[1500px] mx-auto h-16 px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <MapPin size={28} className="text-green-500 fill-green-500" />

          <h1 className="text-3xl font-bold text-white">
            Local
            <span className="text-green-500">Connect</span>
          </h1>
        </div>

        {/* Menu */}
        <div className="flex items-center gap-10">
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
          <div className="relative">
            <Bell size={22} className="text-white cursor-pointer" />

            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </div>

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    currentUser?.avatar ||
                    `https://api.dicebear.com/10.x/toon-head/png?seed=${currentUser?.fullName}`
                  }
                  alt=""
                  className="w-11 h-11 rounded-full object-cover border-2 border-green-500"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-white font-semibold leading-5">
                    {currentUser.fullName}
                  </p>
                </div>

                <ChevronDown
                  size={18}
                  className={`text-white transition ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100"
                  >
                    <User size={18} />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      navigate("/login");
                      window.location.reload();
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="border border-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
