import {
  Search,
  MapPin,
  Calendar,
  Filter,
} from "lucide-react";

function ActivityFilter({
  search,
  setSearch,
  location,
  setLocation,
  category,
  setCategory,
  date,
  setDate,
  activeTab,
  setActiveTab,
  onCreateActivity,
}) {
  const tabs = [
    { id: "all", label: "All Activities" },
    { id: "my", label: "My Activities" },
    { id: "joined", label: "Joined" },
    { id: "saved", label: "Saved" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-7">
      {/* TABS + CREATE */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold transition ${
                activeTab === tab.id
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onCreateActivity}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          + Create Activity
        </button>
      </div>

      <div className="border-b mt-2" />

      {/* FILTERS */}
      <div className="grid lg:grid-cols-[2fr_1.4fr_1.2fr_1.2fr_auto] gap-4 mt-4">

        <div className="flex items-center border rounded-xl px-4 h-12">
          <Search size={20} className="text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="flex-1 outline-none ml-3"
          />
        </div>

        <div className="flex items-center border rounded-xl px-4 h-12">
          <MapPin size={20} className="text-gray-400" />

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="flex-1 outline-none ml-3"
          />
        </div>

        <div className="flex items-center border rounded-xl h-12">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-full px-4 outline-none bg-transparent cursor-pointer"
          >
            <option value="All">Categories</option>
            <option value="Sports">Sports</option>
            <option value="Music">Music</option>
            <option value="Food">Food</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Social">Social</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex items-center border rounded-xl px-4 h-12">
          <Calendar size={18} className="text-gray-400" />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 outline-none ml-3 bg-transparent"
          />
        </div>

        <button
          className="border rounded-xl h-12 px-6 flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <Filter size={18} />
          Filter
        </button>

      </div>
    </section>
  );
}

export default ActivityFilter;