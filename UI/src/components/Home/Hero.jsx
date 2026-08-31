import { MapPin, Calendar, Sparkles, PlusCircle, Compass } from "lucide-react";
import heroMap from "../../assets/hero-map.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const [distance, setDistance] = useState(5);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error reading user in Hero:", e);
      }
    }
  }, []);

  // Explore Nearby button
  const handleExploreNearby = () => {
    navigate(`/businesses?distance=${distance}`);
  };

  // View Activities button
  const handleViewActivities = () => {
    navigate("/activities");
  };

  // Open Interactive Map
  const handleOpenMap = () => {
    navigate("/map");
  };

  return (
    <section className="max-w-[1500px] mx-auto px-4 md:px-7 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-green-50/90 via-white to-emerald-50/40 rounded-3xl overflow-hidden border border-green-100/70 shadow-xs">
        {/* LEFT SIDE */}
        <div className="px-6 md:px-12 py-10 md:py-14 flex flex-col justify-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100/90 text-green-800 px-4 py-2 rounded-full w-fit shadow-2xs">
            <Sparkles size={16} className="text-green-600 animate-pulse" />
            <span className="font-bold text-xs md:text-sm tracking-wide">
              {currentUser
                ? `Welcome back, ${currentUser.fullName?.split(" ")[0]}! 👋`
                : "Welcome to LocalConnect"}
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-slate-900 tracking-tight">
            Discover.
            <br />
            Connect.
            <br />
            <span className="text-green-600 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Build Community.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 text-sm md:text-base text-slate-600 leading-relaxed max-w-lg">
            Find local businesses, join sports & social activities, chat with
            neighbors, and discover everything happening around Pune.
          </p>

          {/* Buttons & Actions */}
          <div className="flex flex-wrap items-center gap-3.5 mt-8">
            {/* Explore Nearby */}
            <button
              onClick={handleExploreNearby}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md"
            >
              <Compass size={18} />
              Explore Nearby
            </button>

            {/* View Activities */}
            <button
              onClick={handleViewActivities}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300/90 transition px-6 py-3 rounded-2xl font-bold text-sm shadow-2xs"
            >
              <Calendar size={18} className="text-green-600" />
              View Activities
            </button>

            {/* Map Shortcut */}
            <button
              onClick={handleOpenMap}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white transition px-5 py-3 rounded-2xl font-semibold text-sm shadow-2xs"
            >
              <MapPin size={17} className="text-green-400" />
              Live Map
            </button>
          </div>
        </div>

        {/* RIGHT SIDE (MAP HERO PREVIEW) */}
        <div className="relative min-h-[280px] lg:min-h-[420px] bg-slate-100 overflow-hidden">
          <img
            src={heroMap}
            alt="LocalConnect Map"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Floating Search Radius Widget */}
          <div className="absolute bottom-5 right-5 left-5 sm:left-auto sm:w-[260px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-green-600" />
                Search Distance
              </h3>
              <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                {distance} km
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[2, 5, 10].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setDistance(dist)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    distance === dist
                      ? "bg-green-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                  }`}
                >
                  {dist} km
                </button>
              ))}
            </div>

            <button
              onClick={handleExploreNearby}
              className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs"
            >
              Find within {distance} km
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;