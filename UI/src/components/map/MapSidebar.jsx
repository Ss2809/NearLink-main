import { MapPin, Bookmark } from "lucide-react";

const getBusinessKey = (business) => business?._id || business?.id;

function MapSidebar({
  businesses,
  selectedBusiness,
  setSelectedBusiness,
  category,
  setCategory,
  locationName,
}) {
  return (
    <div className="w-90 bg-white rounded-2xl shadow-md p-5">
      <h2 className="text-2xl font-bold text-slate-900">Explore Nearby</h2>

      <p className="text-gray-500 mt-2">
        Find businesses and activities around you
      </p>

      <div className="mt-6 border rounded-2xl p-4 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <MapPin className="text-green-600" />
          </div>

          <div>
            <h3 className="font-semibold">My Location</h3>
            <p className="text-gray-500 text-sm">
              {locationName || "Getting location..."}
            </p>
          </div>
        </div>

        <MapPin className="text-green-500" />
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCategory("All")}
            className={`px-4 py-2 rounded-xl ${
              category === "All" ? "bg-green-500 text-white" : "bg-gray-100"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setCategory("Businesses")}
            className={`px-4 py-2 rounded-xl ${
              category === "Businesses"
                ? "bg-green-500 text-white"
                : "bg-gray-100"
            }`}
          >
            Businesses
          </button>

          <button
            onClick={() => setCategory("Activities")}
            className={`px-4 py-2 rounded-xl ${
              category === "Activities"
                ? "bg-green-500 text-white"
                : "bg-gray-100"
            }`}
          >
            Activities
          </button>

          <button className="px-4 py-2 rounded-xl bg-gray-100">Saved</button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {businesses.map((business) => {
          const businessKey = getBusinessKey(business);

          return (
            <PlaceCard
              key={businessKey}
              business={business}
              selected={getBusinessKey(selectedBusiness) === businessKey}
              onClick={() => setSelectedBusiness(business)}
            />
          );
        })}
      </div>

      <button className="w-full mt-8 border-2 border-green-500 text-green-600 rounded-xl h-10 hover:bg-green-500 hover:text-white transition">
        View All Places
      </button>
    </div>
  );
}

function PlaceCard({ business, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border rounded-2xl p-4 transition ${
        selected ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <Bookmark className="text-green-600" size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900 truncate">
              {business.name}
            </h3>
            <span className="text-xs text-green-600 font-medium shrink-0">
              {business.category}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1 truncate">
            {business.address}
          </p>
        </div>
      </div>
    </button>
  );
}

export default MapSidebar;
