import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
} from "lucide-react";

function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/business/${id}`)
      .then((res) => {
        setBusiness(res.data.business);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleDirections = () => {
    if (!business) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;

    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold">Loading...</h2>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold">Business Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero */}
      <div className="relative">
        <img
          src={business.image}
          alt={business.name}
          className="w-full h-[380px] object-cover"
        />

        <div className="absolute inset-0 bg-black/40"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white px-4 py-2 rounded-xl shadow flex items-center gap-2 hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  business.isOpen
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {business.isOpen ? "Open" : "Closed"}
              </span>

              <h1 className="text-4xl font-bold mt-4">{business.name}</h1>

              <p className="text-gray-500 mt-2">{business.category}</p>

              <div className="flex items-center gap-2 mt-4">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />

                <span className="font-semibold">{business.rating}</span>

                <span className="text-gray-500">
                  ({business.totalReviews} Reviews)
                </span>
              </div>
            </div>

            <button
              onClick={handleDirections}
              className="h-12 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
            >
              Get Directions
            </button>
          </div>

          <hr className="my-8" />

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <MapPin className="text-green-600" />
              <span>{business.address}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-green-600" />
              <span>{business.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-green-600" />
              <span>{business.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="text-green-600" />
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {business.website}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-green-600" />
              <span>{business.openingHours || "Not Available"}</span>
            </div>
          </div>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold mb-3">Description</h2>

          <p className="text-gray-600 leading-7">{business.description}</p>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold mb-4">Business Owner</h2>

          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="font-semibold">
              {business.owner?.fullName || "Unknown Owner"}
            </p>

            {business.owner?.email && (
              <p className="text-gray-500">{business.owner.email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetails;
