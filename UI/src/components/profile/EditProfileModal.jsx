import { X, User, Mail, MapPin, Phone, FileText, Camera, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { USER_API_URL } from "../../config/api";

const PHOTO_UPLOAD_URL = `${USER_API_URL}/profile/photo`;

function EditProfileModal({ open, setOpen, user, onSuccess }) {
  if (!open) return null;

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [location, setLocation] = useState(user?.location || "Pune, Maharashtra");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [preview, setPreview] = useState(
    user?.avatar ||
      `https://api.dicebear.com/10.x/toon-head/png?seed=${user?.fullName || "user"}`
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please choose a JPG, PNG, or WebP image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to save changes.");
      return;
    }

    try {
      setSaving(true);

      let finalAvatarUrl = user?.avatar || "";

      // 1. If user selected a new photo file, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);

        const uploadRes = await axios.put(PHOTO_UPLOAD_URL, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        finalAvatarUrl = uploadRes.data.avatar || uploadRes.data.user?.avatar;
      }

      // 2. Update text profile details
      const updateRes = await axios.put(
        USER_API_URL,
        {
          fullName: fullName.trim(),
          email: email.trim(),
          location: location.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          avatar: finalAvatarUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = updateRes.data.user;

      // Sync with localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");

      if (onSuccess) {
        onSuccess(updatedUser);
      }

      setOpen(false);
    } catch (error) {
      console.error("Save profile error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Update your personal details & profile photo
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="edit-profile-form"
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Avatar Photo Selector */}
          <div className="flex flex-col items-center justify-center pt-2 pb-1">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-500 shadow-md bg-slate-100">
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-md transition border-2 border-white"
                title="Change Photo"
              >
                <Camera size={14} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Click the camera icon to choose a new photo
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="flex items-center border border-slate-200 rounded-xl px-3 h-11 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
              <User size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Your full name"
                className="ml-2.5 flex-1 bg-transparent text-sm outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="flex items-center border border-slate-200 rounded-xl px-3 h-11 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                className="ml-2.5 flex-1 bg-transparent text-sm outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Location & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl px-3 h-11 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className="ml-2.5 flex-1 bg-transparent text-sm outline-none text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl px-3 h-11 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="ml-2.5 flex-1 bg-transparent text-sm outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              About / Bio
            </label>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 focus-within:border-green-500 focus-within:bg-white transition">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short bio about yourself..."
                rows="3"
                maxLength="300"
                className="w-full bg-transparent text-sm outline-none text-slate-800 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-xl text-slate-700 hover:bg-white transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-profile-form"
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
