import { Search, MapPin, ChevronDown } from "lucide-react";

function MapHero({ search, setSearch, distance, setDistance }) {
  return (
    <section className="max-w-[1500px] mx-auto px-6 py-1">
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid lg:grid-cols-[2fr_auto_auto_auto_auto] gap-4">
        

          <div className="flex items-center border rounded-xl px-4 h-12">
            <Search className="text-gray-400" size={17} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location, business or activity..."
              className="flex-1 ml-3 outline-none"
            />
          </div>


          <button className="flex items-center gap-2 border rounded-xl px-6 h-12 hover:bg-gray-100 transition ">
            <MapPin size={18} />
            Near me
            <ChevronDown size={18} />
          </button>

          {/* Distance */}

          <button
            onClick={() => setDistance(2)}
            className={`px-6 h-10 rounded-xl ${
              distance === 2
                ? "bg-green-500 text-white"
                : "border hover:bg-gray-100"
            }`}
          >
            2 km
          </button>

          <button
            onClick={() => setDistance(5)}
            className={`px-6 h-10 rounded-xl ${
              distance === 5
                ? "bg-green-500 text-white"
                : "border hover:bg-gray-100"
            }`}
          >
            5 km
          </button>

          <button
            onClick={() => setDistance(10)}
            className={`px-6 h-10 rounded-xl ${
              distance === 10
                ? "bg-green-500 text-white"
                : "border hover:bg-gray-100"
            }`}
          >
            10 km
          </button>
        </div>
      </div>
    </section>
  );
}

export default MapHero;
