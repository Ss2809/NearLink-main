import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
} from "lucide-react";

function ActivityCard1({ activity }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-4">

      <div className="grid lg:grid-cols-[170px_1fr_160px] gap-4 items-center">

        {/* Image */}
        <img
          src={activity.image}
          alt={activity.title}
          className="w-full h-32 rounded-xl object-cover"
        />

        {/* Center Content */}
        <div>

          {/* Category */}
          <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
            {activity.category}
          </span>

          {/* Title */}
          <h2 className="text-xl font-semibold mt-2">
            {activity.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {activity.description}
          </p>

          {/* Date Time Location */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">

            <div className="flex items-center gap-1">
              <Calendar size={15} />
              {activity.date}
            </div>

            <div className="flex items-center gap-1">
              <Clock size={15} />
              {activity.time}
            </div>

            <div className="flex items-center gap-1">
              <MapPin size={15} />
              {activity.location}
            </div>

          </div>

          {/* Participants */}
          <div className="flex items-center mt-4">

            <img
              src="https://i.pravatar.cc/40?img=1"
              alt=""
              className="w-8 h-8 rounded-full border-2 border-white"
            />

            <img
              src="https://i.pravatar.cc/40?img=2"
              alt=""
              className="w-8 h-8 rounded-full border-2 border-white -ml-2"
            />

            <img
              src="https://i.pravatar.cc/40?img=3"
              alt=""
              className="w-8 h-8 rounded-full border-2 border-white -ml-2"
            />

            <img
              src="https://i.pravatar.cc/40?img=4"
              alt=""
              className="w-8 h-8 rounded-full border-2 border-white -ml-2"
            />

            <span className="ml-3 text-sm text-gray-500">
              +{activity.extraParticipants}
            </span>

          </div>

        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-between items-end h-full">

          <div className="text-right">

            <h3 className="text-xl font-bold">
              {activity.going}
            </h3>

            <p className="text-sm text-green-600 font-semibold">
              Going
            </p>

          </div>

          <div className="flex gap-2 mt-6">

            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
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