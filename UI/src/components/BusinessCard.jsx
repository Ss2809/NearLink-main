import { Star, MapPin, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

function BusinessCard({ business }) {
  const imageUrl =
    business.image && business.image.trim() !== ""
      ? business.image
      : "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600";

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={business.name}
          className="w-full h-56 object-cover"
        />

        <span
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold shadow ${
            business.isOpen
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {business.isOpen ? "Open" : "Closed"}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name & Category */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">{business.name}</h3>

          <p className="text-sm text-gray-500 mt-1">{business.category}</p>
        </div>

        {/* Rating & Location */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />

            <span className="font-semibold text-gray-800">
              {business.rating || 0}
            </span>

            <span className="text-sm text-gray-500">
              ({business.totalReviews || 0} reviews)
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MapPin size={15} />
            <span>{business.city}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-6 line-clamp-2 min-h-[48px]">
          {business.description}
        </p>

        {/* Address */}
        <p className="text-sm text-gray-500 mt-4 flex items-start gap-2">
          <MapPin size={16} className="text-green-500 mt-0.5 shrink-0" />
          <span>{business.address}</span>
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <Link
            to={`/business/${business._id || business.id}`}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 text-center"
          >
            View Details
          </Link>

          <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
            <Bookmark size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BusinessCard;
