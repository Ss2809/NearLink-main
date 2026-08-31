import { useState } from "react";
import axios from "axios";
import { X, Sparkles, Target, Palette, Smile } from "lucide-react";
import { toast } from "react-toastify";
import { CHAT_API_URL as CHAT_BASE_URL } from "../../config/api";

const CHAT_API_URL = `${CHAT_BASE_URL}/communities`;

const ICON_PRESETS = ["💬", "🧹", "💪", "🚴", "⚽", "📚", "🎨", "🎵", "🌳", "🍕", "🐾", "☕"];

const COLOR_PRESETS = [
  { label: "Purple", class: "bg-purple-500", border: "border-purple-500" },
  { label: "Orange", class: "bg-orange-500", border: "border-orange-500" },
  { label: "Blue", class: "bg-blue-500", border: "border-blue-500" },
  { label: "Emerald", class: "bg-emerald-500", border: "border-emerald-500" },
  { label: "Pink", class: "bg-pink-500", border: "border-pink-500" },
  { label: "Indigo", class: "bg-indigo-500", border: "border-indigo-500" },
  { label: "Amber", class: "bg-amber-500", border: "border-amber-500" },
  { label: "Teal", class: "bg-teal-500", border: "border-teal-500" },
];

export default function CreateCommunityModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "💬",
    color: "bg-purple-500",
    pinnedGoal: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please provide a community name");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        CHAT_API_URL,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Community created successfully!");
      if (onSuccess) {
        onSuccess(response.data.community);
      }
      onClose();
    } catch (error) {
      console.error("Create community error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create community"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Community</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Start a new neighborhood discussion group
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="create-community-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Community Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Community Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Pune Cycling Club"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Icon / Emoji Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Smile size={16} className="text-purple-600" />
              Choose an Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition ${
                    formData.icon === emoji
                      ? "border-purple-600 bg-purple-50 scale-110 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette size={16} className="text-purple-600" />
              Color Theme
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.class}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.class })}
                  className={`w-8 h-8 rounded-full ${color.class} transition ${
                    formData.color === color.class
                      ? "ring-4 ring-purple-200 scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this community all about?"
              rows="2"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Pinned Goal / Topic */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Target size={16} className="text-purple-600" />
              Community Goal / Pinned Topic
            </label>
            <input
              type="text"
              name="pinnedGoal"
              value={formData.pinnedGoal}
              onChange={handleChange}
              placeholder="e.g. Let's make our neighborhood greener!"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-xl text-slate-700 hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-community-form"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Sparkles size={16} />
            {loading ? "Creating..." : "Create Community"}
          </button>
        </div>
      </div>
    </div>
  );
}
