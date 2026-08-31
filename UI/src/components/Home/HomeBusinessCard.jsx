import { MapPin, Phone, Star, Store, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateDistance } from "../../pages/map";

const categoryThumbnails = {
  Cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500",
  Restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
  Gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
  Fitness: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
  Hospital: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500",
  Healthcare: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500",
  Medical: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500",
  Pharmacy: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500",
  Hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
  Shopping: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500",
  Shop: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500",
  Salon: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
  Education: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500",
  Other: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500",
};

function HomeBusinessCard({ business, userCoords }) {
  const navigate = useNavigate();

  if (!business) return null;

  const {
    _id,
    id,
    name,
    category,
    address,
    location,
    city,
    phone,
    latitude,
    longitude,
    image,
    rating,
  } = business;

  const businessId = _id || id;

  const lat = Number(latitude ?? location?.coordinates?.[1]);
  const lng = Number(longitude ?? location?.coordinates?.[0]);

  let distanceKm = null;
  if (
    userCoords &&
    Number.isFinite(userCoords.latitude) &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    distanceKm = calculateDistance(
      userCoords.latitude,
      userCoords.longitude,
      lat,
      lng
    );
  }

  const thumbUrl =
    image && image.trim() !== ""
      ? image
      : categoryThumbnails[category] || categoryThumbnails.Other;

  return (
    <div
      onClick={() => navigate("/businesses")}
      className="group flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer shadow-xs"
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={thumbUrl}
          alt={name || "Business"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
          {category || "Local Business"}
        </div>

        {distanceKm !== null && (
          <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
            📍 {distanceKm} km away
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-green-600 transition">
            {name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin size={14} className="text-green-600 shrink-0" />
            <span className="truncate">{address || city || "Pune, Maharashtra"}</span>
          </div>

          {phone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Phone size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{phone}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
            Verified Place
          </span>

          <span className="text-xs font-bold text-slate-700 flex items-center gap-1 group-hover:text-green-600 transition">
            Details <ExternalLink size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default HomeBusinessCard;
