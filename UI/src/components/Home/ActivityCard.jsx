import { MapPin, Calendar, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";

function ActivityCard({ activity }) {
  const navigate = useNavigate();

  if (!activity) return null;

  const {
    _id,
    id,
    title,
    image,
    category,
    location,
    city,
    date,
    startTime,
    participants,
    maxParticipants,
    createdBy,
  } = activity;

  const activityId = _id || id;
  const participantCount = participants?.length || 0;
  const spotsLeft =
    maxParticipants > 0 ? Math.max(0, maxParticipants - participantCount) : null;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : "";

  const imageUrl =
    image && image.trim() !== ""
      ? image
      : "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600";

  return (
    <div
      onClick={() => navigate(`/activity/${activityId}`)}
      className="group flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer shadow-xs"
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title || "Activity"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
          {category || "General"}
        </div>

        {spotsLeft !== null && (
          <div
            className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs ${
              spotsLeft === 0
                ? "bg-red-500 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {spotsLeft === 0 ? "Full" : `${spotsLeft} spots left`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-green-600 transition">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin size={14} className="text-green-600 shrink-0" />
            <span className="truncate">{location || city || "Pune"}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-green-600 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {startTime && (
              <div className="flex items-center gap-1">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span>{startTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info: Organizer & Enrolled */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={createdBy?.avatar}
              name={createdBy?.fullName || "Organizer"}
              size="xs"
              border
            />
            <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[100px]">
              {createdBy?.fullName?.split(" ")[0] || "Organizer"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            <Users size={12} className="text-slate-500" />
            <span>{participantCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityCard;