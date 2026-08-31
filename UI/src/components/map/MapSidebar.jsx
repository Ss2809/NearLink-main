import { MapPin, Store, Calendar, Star, Clock, Users, Navigation, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

function MapSidebar({
  items = [],
  selectedItem,
  setSelectedItem,
  category,
  setCategory,
  userLocation,
  locationName,
  loading,
}) {
  const getItemKey = (item) => item?._id || item?.id;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Explore Nearby</h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {items.length} places
          </span>
        </div>

        {/* User Location Bar */}
        <div className="mt-3 flex items-center justify-between p-2.5 bg-green-50/70 border border-green-200/60 rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Navigation size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-800">
                Your Location
              </p>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {locationName || "Detecting position..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 size={24} className="animate-spin text-green-600 mx-auto mb-2" />
            <p className="text-xs font-medium">Loading nearby places...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <MapPin size={28} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No places found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query, increasing distance radius, or switching categories.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const itemKey = getItemKey(item);
            const isSelected = getItemKey(selectedItem) === itemKey;
            const isBusiness = item.itemType === "business";

            return (
              <button
                key={itemKey}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-3 rounded-2xl border transition flex gap-3 group ${
                  isSelected
                    ? "border-green-500 bg-green-50/70 shadow-sm ring-2 ring-green-400/30"
                    : "border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/60">
                  <img
                    src={
                      item.image ||
                      (isBusiness
                        ? "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"
                        : "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400")
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span
                    className={`absolute top-1 left-1 p-1 rounded-md text-[10px] text-white shadow-xs ${
                      isBusiness ? "bg-green-600" : "bg-purple-600"
                    }`}
                  >
                    {isBusiness ? <Store size={10} /> : <Calendar size={10} />}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {item.name}
                      </h3>
                      {item.distance !== null && (
                        <span className="text-[11px] font-bold text-green-700 bg-green-100/80 px-1.5 py-0.5 rounded-md shrink-0">
                          {item.distance} km
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                      {isBusiness && item.rating > 0 && (
                        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                          <Star size={11} className="fill-amber-500 text-amber-500" />
                          {item.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1">
                    <MapPin size={12} className="shrink-0 text-slate-400" />
                    {item.address}, {item.city}
                  </p>

                  {/* Activity Timing */}
                  {!isBusiness && item.startTime && (
                    <p className="text-[11px] text-purple-700 font-medium flex items-center gap-1 mt-1">
                      <Clock size={11} className="shrink-0" />
                      {item.date ? new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Upcoming"} • {item.startTime}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MapSidebar;
