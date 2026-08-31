import { useState } from "react";
import axios from "axios";
import { X, Calendar, Clock, MapPin, Users, Image, LocateFixed, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { ACTIVITY_API_URL } from "../../config/api";

function CreateActivityModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Sports",
    image: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    city: "Pune",
    latitude: 18.5204, // Default Pune center
    longitude: 73.8567,
    maxParticipants: "",
  });

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        toast.warn("Could not get GPS location. Default coordinates will be used.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const latNum = Number(formData.latitude) || 18.5204;
    const lngNum = Number(formData.longitude) || 73.8567;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        ACTIVITY_API_URL,
        {
          ...formData,
          latitude: latNum,
          longitude: lngNum,
          maxParticipants: Number(formData.maxParticipants) || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Activity created successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Activity</h2>
            <p className="text-sm text-gray-500 mt-1">
              Share an activity with your community
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          id="create-activity-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Activity Title *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Morning Football Match"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-400 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell people about your activity..."
              required
              rows="3"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none resize-none focus:ring-2 focus:ring-green-400 text-sm"
            />
          </div>

          {/* Category + Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-400 text-sm bg-white"
              >
                <option value="Sports">Sports</option>
                <option value="Music">Music</option>
                <option value="Food">Food</option>
                <option value="Education">Education</option>
                <option value="Technology">Technology</option>
                <option value="Social">Social</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Maximum Participants (0 = Unlimited)
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3">
                <Users size={18} className="text-gray-400 shrink-0" />
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  placeholder="e.g. 20 (0 for unlimited)"
                  min="0"
                  className="w-full px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date + Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Date & Time *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl px-3">
                <Calendar size={18} className="text-gray-400 shrink-0" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex items-center border border-gray-200 rounded-xl px-3">
                <Clock size={18} className="text-gray-400 shrink-0" />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex items-center border border-gray-200 rounded-xl px-3">
                <Clock size={18} className="text-gray-400 shrink-0" />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  placeholder="End time"
                  className="w-full px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Location *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl px-3">
                <MapPin size={18} className="text-gray-400 shrink-0" />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Wagholi Ground, Lane 4"
                  required
                  className="w-full px-2 py-2.5 text-sm outline-none"
                />
              </div>

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City (e.g. Pune)"
                required
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Coordinates & GPS */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-green-600" />
                Map Location & Coordinates
              </span>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition"
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
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="18.5204"
                  className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="73.8567"
                  className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Activity Image URL <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3">
              <Image size={18} className="text-gray-400 shrink-0" />
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
        </form>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-activity-form"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm"
          >
            {loading ? "Creating..." : "Create Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateActivityModal;
