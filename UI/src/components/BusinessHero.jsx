import { Search, Plus, Store } from "lucide-react";
import businessHero from "../assets/business-hero.png";

function BusinessHero({
  search,
  setSearch,
  sort,
  setSort,
  category,
  setCategory,
  onRegisterBusiness,
}) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-6 ">
      <div className="relative overflow-hidden rounded-[32px] shadow-xl">
        <img
          src={businessHero}
          alt="Business Hero"
          className="w-full h-[450px] object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent"></div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-2xl px-8 md:px-14">
            <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-xs">
              <Store size={14} /> NearLink Business Directory
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Discover Amazing
              <br />
              Local Businesses
            </h1>

            <p className="mt-4 text-base md:text-lg text-gray-200 leading-relaxed max-w-xl">
              Explore trusted cafes, restaurants, gyms, hospitals and more
              around your location with directions and details.
            </p>

            {onRegisterBusiness && (
              <button
                onClick={onRegisterBusiness}
                className="mt-6 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                Register Your Business
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Search Card */}
      <div className="relative z-20 max-w-5xl mx-auto -mt-10 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full flex items-center h-14 border-2 border-gray-100 rounded-2xl px-5 hover:border-green-400 transition">
            <Search size={22} className="text-green-500" />

            <input
              type="text"
              placeholder="Search by business name, category, city, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 ml-3 outline-none text-slate-800"
            />
          </div>

          {onRegisterBusiness && (
            <button
              onClick={onRegisterBusiness}
              className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 h-14 rounded-2xl transition whitespace-nowrap shadow-sm"
            >
              <Plus size={18} />
              Add Business
            </button>
          )}
        </div>
      </div>

      {/* Categories + Sort */}
      <div className="max-w-7xl mx-auto mt-12">
        {/* Heading */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Popular Businesses
            </h2>

            <p className="text-gray-500 mt-2">
              Explore top-rated businesses around your location.
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium text-sm">Sort By:</span>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none bg-white text-sm font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rating</option>
              <option value="popular">Most Popular</option>
              <option value="name">Name (A-Z)</option>
              <option value="distance">Distance</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "All", value: "All" },
            { label: "☕ Cafe", value: "Cafe" },
            { label: "🍴 Restaurant", value: "Restaurant" },
            { label: "🏋️ Gym", value: "Gym" },
            { label: "🛍️ Shop", value: "Shop" },
            { label: "🏥 Hospital", value: "Hospital" },
            { label: "💊 Medical", value: "Medical" },
            { label: "💇 Salon", value: "Salon" },
            { label: "🏨 Hotel", value: "Hotel" },
            { label: "🎓 Education", value: "Education" },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full border text-sm font-medium transition ${
                category === cat.value
                  ? "bg-green-500 text-white border-green-500 shadow-xs"
                  : "bg-white border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BusinessHero;
