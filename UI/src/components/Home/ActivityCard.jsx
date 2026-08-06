import { MapPin } from "lucide-react";

function ActivityCard({ image, title, location, date }) {
  return (
    <div className="flex items-center gap-3">

      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-20 h-16 rounded-lg object-cover"
      />

      {/* Content */}
      <div>

        <h2 className="text-lg font-semibold text-gray-800">
          {title}
        </h2>

        <div className="flex items-center gap-1 mt-1">

          <MapPin size={14} className="text-green-600" />

          <span className="text-sm text-gray-600">
            {location}
          </span>

        </div>

        <p className="mt-1 text-sm text-gray-500">
          {date}
        </p>

      </div>

    </div>
  );
}

export default ActivityCard;