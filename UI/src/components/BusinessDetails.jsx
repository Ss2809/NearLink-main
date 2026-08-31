import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  Edit3,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Navigation,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import BusinessModal from "./business/BusinessModal";
import { calculateDistance } from "../pages/map";
import { BUSINESS_API_URL } from "../config/api";

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const businessMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get current logged-in user
  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return null;
      return JSON.parse(storedUser);
    } catch (error) {
      console.log("Error reading user:", error);
      return null;
    }
  };

  const currentUserId = getCurrentUser()?._id || getCurrentUser()?.id;

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BUSINESS_API_URL}/${id}`);
      setBusiness(res.data.business);
    } catch (err) {
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBusiness();
    }
  }, [id]);

  // Request user location for distance calculation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  // Compute distance when location or business updates
  useEffect(() => {
    if (
      userLocation &&
      business &&
      Number.isFinite(business.latitude) &&
      Number.isFinite(business.longitude)
    ) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        business.latitude,
        business.longitude
      );
      setDistanceKm(dist);
    }
  }, [userLocation, business]);

  const handleDirections = () => {
    if (!business) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
    window.open(url, "_blank");
  };

  const handleDeleteBusiness = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`${BUSINESS_API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Business deleted successfully");
      setShowDeleteConfirm(false);
      navigate("/businesses");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete business"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white px-8 py-5 rounded-2xl shadow flex items-center gap-3">
          <Loader2 className="animate-spin text-green-600" size={24} />
          <p className="font-medium text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Business Not Found</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          This business listing may have been removed or does not exist in the database.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate("/businesses")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-sm"
          >
            Browse Businesses
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-sm"
          >
            My Profile
          </button>
        </div>
      </div>
    );
  }

  const ownerId =
    business.owner?._id || business.owner?.id || business.owner;
  const isOwner =
    currentUserId && ownerId && ownerId.toString() === currentUserId.toString();

  const businessImageUrl =
    business.image && business.image.trim() !== ""
      ? business.image
      : "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200";

  const hasValidCoordinates =
    Number.isFinite(business.latitude) &&
    Number.isFinite(business.longitude) &&
    business.latitude !== 0 &&
    business.longitude !== 0;

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {/* Hero Header */}
      <div className="relative">
        <img
          src={businessImageUrl}
          alt={business.name}
          className="w-full h-[380px] object-cover"
        />

        <div className="absolute inset-0 bg-black/45"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-sm font-semibold transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Owner Toolbar (Top Right) */}
        {isOwner && (
          <div className="absolute top-6 right-6 flex items-center gap-2.5">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md"
            >
              <Edit3 size={16} className="text-green-600" />
              Edit Business
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10 space-y-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    business.isOpen
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {business.isOpen ? "Open Now" : "Closed"}
                </span>

                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {business.category}
                </span>

                {distanceKm !== null && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    📍 {distanceKm} km away from you
                  </span>
                )}

                {isOwner && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    <ShieldCheck size={14} /> You own this business
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3">
                {business.name}
              </h1>

              <div className="flex items-center gap-2 mt-3">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="font-bold text-slate-800 text-lg">
                  {business.rating || 0}
                </span>
                <span className="text-gray-500 text-sm">
                  ({business.totalReviews || 0} Reviews)
                </span>
              </div>
            </div>

            {hasValidCoordinates && (
              <button
                onClick={handleDirections}
                className="h-12 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                <Navigation size={18} />
                Get Directions
              </button>
            )}
          </div>

          <hr className="my-8 border-gray-100" />

          {/* Details Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
              <MapPin className="text-green-600 shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">Address</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {business.address}, {business.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
              <Phone className="text-green-600 shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">Phone</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {business.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
              <Mail className="text-green-600 shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {business.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
              <Clock className="text-green-600 shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">Hours</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {business.openingHours || "Not specified"}
                </p>
              </div>
            </div>

            {business.website && (
              <div className="sm:col-span-2 flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                <Globe className="text-green-600 shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Website</p>
                  <a
                    href={
                      business.website.startsWith("http")
                        ? business.website
                        : `https://${business.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:underline truncate block"
                  >
                    {business.website}
                  </a>
                </div>
              </div>
            )}
          </div>

          <hr className="my-8 border-gray-100" />

          {/* Description */}
          <h2 className="text-xl font-bold text-gray-900 mb-3">About the Business</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {business.description || "No description provided for this business."}
          </p>

          <hr className="my-8 border-gray-100" />

          {/* Owner Info */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Business Owner</h2>
          <div className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">
                {business.owner?.fullName || "Verified Business Owner"}
                {isOwner && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </p>
              {business.owner?.email && (
                <p className="text-sm text-gray-500 mt-0.5">{business.owner.email}</p>
              )}
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-slate-800 text-xs font-semibold rounded-xl border border-gray-200 shadow-2xs transition"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE LOCATION & MAP SECTION */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="text-green-600" size={22} />
                Location & Directions
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {business.address}, {business.city}
              </p>
            </div>

            {hasValidCoordinates && (
              <button
                onClick={handleDirections}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto"
              >
                <ExternalLink size={14} /> Open in Google Maps
              </button>
            )}
          </div>

          {hasValidCoordinates ? (
            <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
              <MapContainer
                center={[business.latitude, business.longitude]}
                zoom={15}
                className="w-full h-full"
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[business.latitude, business.longitude]}
                  icon={businessMarkerIcon}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong className="block font-bold text-slate-900">{business.name}</strong>
                      <span className="text-gray-500">{business.address}</span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-gray-400">
              <MapPin size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">Exact coordinates not specified</p>
              <p className="text-xs text-gray-400 mt-0.5">{business.address}, {business.city}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Business Modal */}
      {showEditModal && business && (
        <BusinessModal
          business={business}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setBusiness(updated);
            toast.success("Business details updated successfully!");
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && business && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-red-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900">Delete this Business?</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{business.name}"</strong>? This will remove the listing and map marker. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBusiness}
                disabled={deleting}
                className="px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Business"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessDetails;
