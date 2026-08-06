import { MapPin, Calendar } from "lucide-react";
import heroMap from "../../assets/hero-map.png";
import { useState } from "react";

function Hero() {
  const[distance, setDistance] = useState(2);
  console.log(distance);
  
  return (
    <section className="w-full bg-white py-1">
      <div className="max-w-[1500px] mx-auto px-6">
        <div className="grid lg:grid-cols-[46%_54%] items-center bg-gradient-to-r from-green-50 to-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* LEFT SIDE */}

          <div className="px-10 py-8">
            {/* Badge */}

            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <MapPin size={16} />

              <span className="font-semibold text-sm">
                Welcome to Local Connect
              </span>
            </div>

            {/* Heading */}

            <h1 className="mt-6 text-[44px] font-extrabold leading-[54px] text-slate-900">
              Discover.
              <br />
              Connect.
              <br />
              <span className="text-green-500">Build Community.</span>
            </h1>

            {/* Description */}

            <p className="mt-5 text-base text-gray-600 leading-7 max-w-md">
              Find local businesses, join community activities, chat with
              neighbors and discover everything happening around you.
            </p>

            {/* Buttons */}

            <div className="flex gap-4 mt-8">
              <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 transition text-white px-6 py-3 rounded-xl font-semibold shadow">
                <MapPin size={18} />
                Explore Nearby
              </button>

              <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100 text-gray-800 transition px-6 py-3 rounded-xl font-semibold">
                <Calendar size={18} />
                View Activities
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="relative h-[430px]">
            <img
              src={heroMap}
              alt="Hero Map"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Search Card */}

            <div className="absolute bottom-5 right-5 bg-white rounded-2xl shadow-xl p-4 w-[240px]">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Search within
              </h3>

              <div className="flex justify-between">
                <button
                  onClick={() => setDistance(2)}
                  className={`w-14 h-9 rounded-lg text-xs font-semibold transition ${
                    distance === 2
                      ? "bg-green-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  2 km
                </button>

                <button
                  onClick={() => setDistance(5)}
                  className={`w-14 h-9 rounded-lg text-xs font-semibold transition ${
                    distance === 5
                      ? "bg-green-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  5 km
                </button>

                <button
                  onClick={() => setDistance(10)}
                  className={`w-14 h-9 rounded-lg text-xs font-semibold transition ${
                    distance === 10
                      ? "bg-green-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  10 km
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
