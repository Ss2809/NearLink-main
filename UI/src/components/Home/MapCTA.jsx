import { Map, MapPin, Navigation, Compass, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MapCTA() {
  const navigate = useNavigate();

  return (
    <section className="max-w-[1500px] mx-auto mt-6 px-4 md:px-7 py-4">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-700 shadow-md p-8 md:p-12 text-white">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
              <Navigation size={14} className="animate-spin text-green-400" />
              Live Geolocation & Radar Active
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Explore Your Neighborhood on the{" "}
              <span className="text-green-400">Interactive Map</span>
            </h2>

            <p className="text-slate-300 text-sm md:text-base mt-3 leading-relaxed">
              Locate verified cafes ☕, gyms 🏋️, clinics 🏥, hotels 🏨, and sports
              meetups 📅 across Pune with real-time distance calculations and 1-click directions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <button
              onClick={() => navigate("/map")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-7 py-3.5 rounded-2xl transition shadow-lg hover:shadow-green-500/20 text-sm group"
            >
              <Map size={18} />
              Open Interactive Map
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapCTA;
