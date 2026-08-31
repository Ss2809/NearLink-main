import { Search, MapPin, Loader2, Filter, Store, Calendar, X } from "lucide-react";

function MapHero({
  search,
  setSearch,
  distance,
  setDistance,
  onLocateMe,
  locating,
  locationName,
  category,
  setCategory,
  totalCount,
}) {
  return (
    <section className="max-w-[1600px] w-full mx-auto px-4 md:px-6 pt-3 pb-1">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1 flex items-center border border-slate-200 rounded-xl px-4 h-12 bg-slate-50/50 hover:border-green-400 focus-within:border-green-500 focus-within:bg-white transition">
            <Search className="text-slate-400 shrink-0" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or address..."
              className="flex-1 ml-3 bg-transparent outline-none text-sm text-slate-800"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Locate Me Button */}
            <button
              type="button"
              onClick={onLocateMe}
              disabled={locating}
              className="flex items-center gap-1.5 border border-slate-200 hover:border-green-500 bg-slate-50 hover:bg-green-50 text-slate-700 hover:text-green-700 rounded-xl px-3.5 h-12 text-xs font-semibold transition shrink-0"
              title="Locate my position"
            >
              {locating ? (
                <Loader2 size={15} className="animate-spin text-green-600" />
              ) : (
                <MapPin size={15} className="text-green-600" />
              )}
              <span>{locating ? "Locating..." : locationName || "Near Me"}</span>
            </button>

            {/* Entity Types */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setCategory("All")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  category === "All"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCategory("Businesses")}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  category === "Businesses"
                    ? "bg-white text-green-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Store size={13} />
                Businesses
              </button>
              <button
                type="button"
                onClick={() => setCategory("Activities")}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  category === "Activities"
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar size={13} />
                Activities
              </button>
            </div>

            {/* Radius Pills */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 shrink-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                Radius:
              </span>
              {[
                { label: "5 km", value: 5 },
                { label: "10 km", value: 10 },
                { label: "25 km", value: 25 },
                { label: "All", value: 0 },
              ].map((dist) => (
                <button
                  key={dist.value}
                  type="button"
                  onClick={() => setDistance(dist.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    distance === dist.value
                      ? "bg-green-600 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {dist.label}
                </button>
              ))}
            </div>

            {/* Total Results Count */}
            <span className="hidden xl:inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
              {totalCount} {totalCount === 1 ? "result" : "results"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapHero;
