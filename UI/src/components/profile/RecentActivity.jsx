import { Clock, MapPin, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function RecentActivity({ activities }) {
  const navigate = useNavigate();

  const activityList = activities || [];

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recent Activities</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Events you organized or joined
          </p>
        </div>

        <button
          onClick={() => navigate("/activities")}
          className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition"
        >
          Explore All <ArrowRight size={14} />
        </button>
      </div>

      {activityList.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Calendar size={28} className="text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            No recent activities yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Join a local event or create an activity to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activityList.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/activity/${item._id}`)}
              className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition border border-slate-100 cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Calendar size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-green-700 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin size={12} className="shrink-0" />
                    <span>{item.location || item.city || "Pune"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs shrink-0 font-medium">
                <Clock size={14} />
                <span>
                  {item.date
                    ? new Date(item.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })
                    : "Upcoming"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;