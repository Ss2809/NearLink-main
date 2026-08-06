import {
  Search,
  MapPin,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";

function ActivityFilter() {
  return (
    <section className="max-w-7xl mx-auto px-7">

      {/* Tabs + Button */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        {/* Tabs */}
        <div className="flex gap-10">

          <button className="text-green-600 font-semibold border-b-2 border-green-600 pb-3">
            All Activities
          </button>

          <button className="text-gray-600 hover:text-green-600 transition">
            My Activities
          </button>

          <button className="text-gray-600 hover:text-green-600 transition">
            Joined
          </button>

          <button className="text-gray-600 hover:text-green-600 transition">
            Saved
          </button>

        </div>

        {/* Create Button */}

        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold">
          + Create Activity
        </button>

      </div>

      {/* Divider */}

      <div className="border-b mt-2"></div>

      {/* Search Filters */}

      <div className="grid lg:grid-cols-[2fr_1.4fr_1.2fr_1.2fr_auto] gap-4 mt-4">

        {/* Search */}

        <div className="flex items-center border rounded-xl px-4 h-12">

          <Search size={20} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search activities..."
            className="flex-1 outline-none ml-3"
          />

        </div>

        {/* Location */}

        <div className="flex items-center border rounded-xl px-4 h-12">

          <MapPin size={20} className="text-gray-400" />

          <input
            type="text"
            placeholder="Location"
            className="flex-1 outline-none ml-3"
          />

        </div>

        {/* Category */}

        <div className="flex items-center justify-between border rounded-xl px-4 h-12 cursor-pointer">

          <span className="text-gray-500">
            Categories
          </span>

          <ChevronDown size={18} />

        </div>

        {/* Date */}

        <div className="flex items-center justify-between border rounded-xl px-4 h-12 cursor-pointer">

          <div className="flex items-center gap-3">

            <Calendar size={18} className="text-gray-400" />

            <span className="text-gray-500">
              Date
            </span>

          </div>

          <ChevronDown size={18} />

        </div>

        {/* Filter */}

        <button className="border rounded-xl h-12 px-6 flex items-center justify-center gap-2 hover:bg-gray-100 transition">

          <Filter size={18} />

          Filter

        </button>

      </div>

    </section>
  );
}

export default ActivityFilter;