import { Search, MapPin } from "lucide-react";
import businessHero from "../assets/business-hero.png";
import { ChevronDown } from "lucide-react";

function BusinessHero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-6 ">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-md">

        <img
          src={businessHero}
          alt="Business Hero"
          className="w-full h-65 object-cover "
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="pl-10 md:pl-14 max-w-lg">

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Discover Local
              <br />
              Businesses
            </h1>

            <p className="mt-4 text-lg text-gray-700 leading-7">
              Connect with trusted local businesses, discover new services,
              and support your neighborhood with confidence.
            </p>

          </div>
        </div>

      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-md p-6 max-w-6xl mx-auto mt-5 relative z-10">

        <div className="grid lg:grid-cols-[2fr_1.5fr_auto] gap-4">

          {/* Search */}
          <div className="flex items-center border border-gray-200 rounded-xl px-4 h-10">
            <Search size={20} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search businesses, services..."
              className="flex-1 ml-3 outline-none"
            />
          </div>

          {/* Location */}
          <div className="flex items-center border border-gray-200 rounded-xl px-4 h-10">
            <MapPin size={20} className="text-gray-400" />

            <input
              type="text"
              placeholder="Enter location"
              className="flex-1 ml-3 outline-none"
            />
          </div>

          {/* Button */}
          <button className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-10 font-semibold h-10 transition">
            Search
          </button>

        </div>

      </div>
      

{/* Categories + Sort */}

<div className="max-w-7xl mx-auto px-6 mt-6">

  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

    {/* Categories */}

    <div className="flex flex-wrap gap-3">

      <button className="px-5 py-2 rounded-full bg-green-500 text-white font-medium">
        All
      </button>

      <button className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        Food & Drink
      </button>

      <button className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        Services
      </button>

      <button className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        Retail
      </button>

      <button className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        Health
      </button>

      <button className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        Education
      </button>

      <button className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2">
        More
        <ChevronDown size={16} />
      </button>

    </div>

    {/* Sort */}

    <div className="flex items-center gap-3">

      <span className="text-gray-600 font-medium">
        Sort by:
      </span>

      <select className="border rounded-xl px-4 py-2 outline-none">
        <option>Distance</option>
        <option>Rating</option>
        <option>Newest</option>
        <option>Popular</option>
      </select>

    </div>

  </div>

  {/* Heading */}


</div>

    </section>
  );
}

export default BusinessHero;