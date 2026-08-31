import { Calendar, Clock, MapPin, Bookmark, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";

function ActivityCard1({ activity }) {
  const navigate = useNavigate();
  const participantCount = activity.participants?.length || 0;
  const maxParticipants = activity.maxParticipants || 0;
  const isCancelled = activity.status === "Cancelled";

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl border ${
        isCancelled ? "border-red-200 bg-red-50/20" : "border-gray-200"
      } shadow-sm hover:shadow-md transition p-4`}
    >
      <div className="grid lg:grid-cols-[170px_1fr_160px] gap-4 items-center">
        {/* Image */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden">
          <img
            src={
              activity.image ||
              "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600"
            }
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          {isCancelled && (
            <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow">
                <Ban size={12} /> Cancelled
              </span>
            </div>
          )}
        </div>

        {/* Center Content */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
              {activity.category}
            </span>

            {isCancelled && (
              <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                Cancelled
              </span>
            )}
          </div>

          <h2 className="text-xl font-semibold mt-2 text-gray-900">{activity.title}</h2>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {activity.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
            <div className="flex items-center gap-1">
              <Calendar size={15} />
              {formatDate(activity.date)}
            </div>

            <div className="flex items-center gap-1">
              <Clock size={15} />
              {activity.startTime}
              {activity.endTime && ` - ${activity.endTime}`}
            </div>

            <div className="flex items-center gap-1">
              <MapPin size={15} />
              {activity.location}, {activity.city}
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center mt-4">
            {participantCount > 0 ? (
              <div className="flex -space-x-2 overflow-hidden items-center">
                {activity.participants.slice(0, 4).map((p, idx) => (
                  <Avatar
                    key={p?._id || p?.id || p || idx}
                    src={p?.avatar}
                    name={p?.fullName || "User"}
                    size="sm"
                    className="border-2 border-white shadow-xs"
                  />
                ))}
              </div>
            ) : null}

            <span className="ml-2.5 text-xs text-gray-500 font-medium">
              {participantCount === 0
                ? "Be the first to join"
                : `${participantCount} joined`}
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-between items-end h-full">
          <div className="text-right">
            <h3 className="text-xl font-bold">
              {participantCount}
              {maxParticipants > 0 && ` / ${maxParticipants}`}
            </h3>

            <p className={`text-sm font-semibold ${isCancelled ? "text-red-500" : "text-green-600"}`}>
              {isCancelled ? "Cancelled" : "Going"}
            </p>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={() =>
                navigate(`/activity/${activity._id || activity.id}`)
              }
              className={`${
                isCancelled
                  ? "bg-slate-700 hover:bg-slate-800"
                  : "bg-green-500 hover:bg-green-600"
              } text-white px-4 py-2 rounded-lg text-sm font-medium transition`}
            >
              View Details
            </button>

            <button className="border border-gray-300 rounded-lg p-2 hover:bg-gray-100">
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityCard1;
