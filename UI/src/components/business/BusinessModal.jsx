import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Image as ImageIcon,
  LocateFixed,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { BUSINESS_API_URL } from "../../config/api";

const CATEGORIES = [
  "Cafe",
  "Restaurant",
  "Gym",
  "Hospital",
  "Medical",
  "Salon",
  "Hotel",
  "Shop",
  "Education",
  "Other",
];

export default function BusinessModal({ business, onClose, onSuccess }) {
  const isEditMode = Boolean(business?._id || business?.id);

  const [formData, setFormData] = useState({
    name: business?.name || "",
    category: business?.category || "Cafe",
    description: business?.description || "",
    address: business?.address || "",
    city: business?.city || "Pune",
    latitude: business?.latitude !== undefined ? business.latitude : "",
    longitude: business?.longitude !== undefined ? business.longitude : "",
    phone: business?.phone || "",
    email: business?.email || "",
    website: business?.website || "",
    image: business?.image || "",
    openingHours: business?.openingHours || "",
    isOpen: business?.isOpen !== undefined ? Boolean(business.isOpen) : true,
  });

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (business && (business._id || business.id)) {
      setFormData({
        name: business.name || "",
        category: business.category || "Cafe",
        description: business.description || "",
        address: business.address || "",
        city: business.city || "Pune",
        latitude: business.latitude !== undefined ? business.latitude : "",
        longitude: business.longitude !== undefined ? business.longitude : "",
        phone: business.phone || "",
        email: business.email || "",
        website: business.website || "",
        image: business.image || "",
        openingHours: business.openingHours || "",
        isOpen: business.isOpen !== undefined ? Boolean(business.isOpen) : true,
      });
    }
  }, [business]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        toast.success("Coordinates retrieved from GPS!");
      },
      (err) => {
        console.error("GPS Error:", err);
        setLocating(false);
        toast.warn("Could not get GPS location. You can enter coordinates manually.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error("Business name and address are required");
      return;
    }

    const latNum = Number(formData.latitude);
    const lngNum = Number(formData.longitude);

    if (
      isNaN(latNum) ||
      isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180
    ) {
      toast.error("Please provide valid latitude (-90 to 90) and longitude (-180 to 180)");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to manage your business");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim() || "Pune",
        latitude: latNum,
        longitude: lngNum,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        image: formData.image.trim(),
        openingHours: formData.openingHours.trim(),
        isOpen: Boolean(formData.isOpen),
      };

      let response;
      if (isEditMode) {
        const businessId = business._id || business.id;
        response = await axios.put(
          `${BUSINESS_API_URL}/${businessId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Business updated successfully!");
      } else {
        response = await axios.post(BUSINESS_API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Business registered successfully!");
      }

      if (onSuccess) {
        onSuccess(response.data.business);
      }
      onClose();
    } catch (error) {
      console.error("Business form error:", error);
      if (error.response?.status === 404) {
        toast.error("This business record was not found or was removed from the database.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to save business"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit Business" : "Register Business"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEditMode
                  ? "Update your business profile and location"
                  : "List your local business on NearLink"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="business-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Business Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Blue Tokai Coffee Roasters"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell customers about your products, services, and atmosphere..."
              rows="3"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Street Address *
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-400">
                <MapPin size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Lane 5, Koregaon Park"
                  required
                  className="w-full px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Pune"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Geographic Coordinates (Latitude & Longitude) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-green-600" />
                Map Location & Coordinates *
              </span>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100/80 hover:bg-green-200/80 px-3 py-1.5 rounded-lg transition"
              >
                {locating ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <LocateFixed size={13} />
                )}
                {locating ? "Locating..." : "Use My Current GPS"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Latitude (-90 to 90) *
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 18.5362"
                  required
                  className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Longitude (-180 to 180) *
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 73.8940"
                  required
                  className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
          </div>

          {/* Contact Details (Phone, Email, Website) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-400">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-2 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Business Email
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-400">
                <Mail size={16} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@business.com"
                  className="w-full px-2 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Website URL
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-400">
                <Globe size={16} className="text-gray-400 shrink-0" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://business.com"
                  className="w-full px-2 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Image & Opening Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Image URL <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-400">
                <ImageIcon size={18} className="text-gray-400 shrink-0" />
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Opening Hours
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-400">
                <Clock size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  placeholder="e.g. Mon-Sat: 9:00 AM - 10:00 PM"
                  className="w-full px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Is Open Toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="isOpen"
              name="isOpen"
              checked={formData.isOpen}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="isOpen" className="text-sm font-semibold text-gray-800 cursor-pointer">
              Currently Open for Customers
            </label>
            <span className="text-xs text-gray-500 ml-auto">
              {formData.isOpen ? "Status: Open" : "Status: Closed"}
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="business-form"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isEditMode ? (
              <Sparkles size={16} />
            ) : (
              <Store size={16} />
            )}
            {loading
              ? isEditMode
                ? "Saving..."
                : "Registering..."
              : isEditMode
              ? "Save Changes"
              : "Register Business"}
          </button>
        </div>
      </div>
    </div>
  );
}
