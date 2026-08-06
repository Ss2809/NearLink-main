import { Star, MapPin, Bookmark } from "lucide-react";

function BusinessCard({ business }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden">

      {/* Image */}
      <img
        src={business.image}
        alt={business.name}
        className="w-full h-44 object-cover"
      />

      {/* Content */}
      <div className="p-4">

        <h3 className="text-lg font-semibold text-gray-900">
          {business.name}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {business.category}
        </p>

        {/* Rating & Distance */}
        <div className="flex justify-between items-center mt-3">

          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={16} fill="currentColor" />
            <span className="text-gray-700 text-sm font-medium">
              {business.rating}
            </span>
            <span className="text-gray-400 text-sm">
              ({business.reviews})
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MapPin size={15} />
            {business.distance}
          </div>

        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">
          {business.description}
        </p>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-5">

          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            View Details
          </button>

          <button className="border border-gray-300 p-2 rounded-lg hover:bg-gray-100">
            <Bookmark size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}

export default BusinessCard;