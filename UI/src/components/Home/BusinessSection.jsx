import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Store, ArrowRight, Loader2, PlusCircle } from "lucide-react";
import HomeBusinessCard from "./HomeBusinessCard";
import { BUSINESS_API_URL as BUSINESS_BASE_URL } from "../../config/api";

const BUSINESS_API_URL = `${BUSINESS_BASE_URL}?page=1&limit=8`;

function BusinessSection() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState(null);

  // Request browser geolocation to compute distance to businesses
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(BUSINESS_API_URL);
      const list =
        response.data?.businesses ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      setBusinesses(list);
    } catch (err) {
      console.error("Fetch home businesses error:", err);
      setError("Unable to load featured businesses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return (
    <section className="max-w-[1500px] mx-auto mt-6 px-4 md:px-7 py-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Store size={18} />
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Featured Local Businesses
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Explore cafes, gyms, restaurants, clinics, and shops in your area.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/businesses")}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition group"
          >
            Explore All Businesses
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 h-64 animate-pulse flex flex-col justify-between"
            >
              <div className="bg-slate-200 h-36 rounded-xl w-full" />
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error Fallback */
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-sm font-semibold text-slate-600">{error}</p>
          <button
            onClick={fetchBusinesses}
            className="mt-3 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      ) : businesses.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-2xl shadow-xs">
          <Store size={32} className="text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">
            No local businesses found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Discover places or add your business to get listed in the directory!
          </p>
          <button
            onClick={() => navigate("/businesses")}
            className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
          >
            <PlusCircle size={15} />
            Browse Businesses
          </button>
        </div>
      ) : (
        /* Businesses Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {businesses.map((biz) => (
            <HomeBusinessCard
              key={biz._id || biz.id}
              business={biz}
              userCoords={userCoords}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default BusinessSection;
