import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, ArrowRight, Loader2, PlusCircle } from "lucide-react";
import ActivityCard from "./ActivityCard";
import { ACTIVITY_API_URL as ACTIVITY_BASE_URL } from "../../config/api";

const ACTIVITY_API_URL = `${ACTIVITY_BASE_URL}?limit=8&page=1`;

function ActivitySection() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(ACTIVITY_API_URL);
      const list = response.data.activities || [];
      // Filter out cancelled activities from the recommended home feed
      const activeOnly = list.filter((act) => act.status !== "Cancelled");
      setActivities(activeOnly);
    } catch (err) {
      console.error("Fetch home activities error:", err);
      setError("Unable to load latest activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <section className="max-w-[1500px] mx-auto mt-6 px-4 md:px-7 py-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">
              <Calendar size={18} />
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Upcoming Community Activities
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Join weekend meetups, sports games, fitness workshops, and social events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/activities")}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-green-600 hover:text-green-700 transition group"
          >
            Explore All Activities
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
            onClick={fetchActivities}
            className="mt-3 px-4 py-1.5 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition"
          >
            Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-2xl shadow-xs">
          <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">
            No upcoming activities found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Be the first in your neighborhood to create an exciting activity!
          </p>
          <button
            onClick={() => navigate("/activities")}
            className="mt-4 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
          >
            <PlusCircle size={15} />
            Create an Activity
          </button>
        </div>
      ) : (
        /* Activities Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activities.map((activity) => (
            <ActivityCard key={activity._id || activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ActivitySection;