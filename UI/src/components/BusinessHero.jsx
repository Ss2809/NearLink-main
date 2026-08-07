import { Search, MapPin } from "lucide-react";
import businessHero from "../assets/business-hero.png";
import { ChevronDown } from "lucide-react";

function BusinessHero({
  search,
  setSearch,
  sort,
  setSort,
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
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
              Discover Amazing
              <br />
              Local Businesses
            </h1>

            <p className="mt-6 text-lg text-gray-200 leading-8 max-w-xl">
              Explore trusted cafes, restaurants, gyms, hospitals and many more
              businesses around your location with reviews, ratings and
              directions.
            </p>
          </div>
        </div>
      </div>
      {/* Floating Search Card */}
      <div className="relative z-20 max-w-5xl mx-auto -mt-10 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          {/* Search */}
          <div className="flex items-center h-16 border-2 border-gray-100 rounded-2xl px-5 hover:border-green-400 transition">
            <Search size={22} className="text-green-500" />

            <input
              type="text"
              placeholder="Search businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 ml-3 outline-none"
            />
          </div>
        </div>
      </div>
      {/* Categories + Sort */}
      <div className="max-w-7xl mx-auto mt-12">
        {/* Heading */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">
              Popular Businesses
            </h2>

            <p className="text-gray-500 mt-2">
              Explore top-rated businesses around your location.
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium">Sort By</span>

            <select
              className="h-12 px-5 rounded-xl border border-gray-200 outline-none hover:border-green-500 transition"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="rating">Highest Rating</option>
              <option value="popular">Most Popular</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 rounded-full bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition">
            All
          </button>

          <button className="px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 transition">
            ☕ Cafe
          </button>

          <button className="px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 transition">
            🍴 Restaurant
          </button>

          <button className="px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 transition">
            🏋️ Gym
          </button>

          <button className="px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 transition">
            🛍️ Shopping
          </button>

          <button className="px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 transition">
            🏥 Hospital
          </button>

          <button className="px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 transition">
            💇 Salon
          </button>

          <button className="px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 transition flex items-center gap-2">
            More
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default BusinessHero;
