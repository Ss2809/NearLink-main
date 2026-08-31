import { MapPin, Calendar, Edit, Camera, Loader2, Phone } from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { USER_API_URL } from "../../config/api";

const PHOTO_UPLOAD_URL = `${USER_API_URL}/profile/photo`;

function ProfileHeader({ user, setOpenEdit, onPhotoUpdated }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side file type & size check
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await axios.put(PHOTO_UPLOAD_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile photo updated successfully!");
      if (onPhotoUpdated && res.data.user) {
        onPhotoUpdated(res.data.user);
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Member";

  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/10.x/toon-head/png?seed=${user?.fullName || "user"}`;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Avatar with Quick-Upload Trigger */}
        <div className="relative group shrink-0">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-md bg-slate-100">
            <img
              src={avatarUrl}
              alt={user?.fullName || "Avatar"}
              className="w-full h-full object-cover"
            />

            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                <Loader2 size={24} className="animate-spin text-green-400" />
                <span className="text-[10px] font-semibold mt-1">Uploading...</span>
              </div>
            )}
          </div>

          {/* Quick upload camera button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-1 right-1 bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-full shadow-lg transition border-2 border-white"
            title="Change Profile Photo"
          >
            <Camera size={16} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* User Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                {user?.fullName}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
            </div>

            <button
              onClick={() => setOpenEdit(true)}
              className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm self-center md:self-start"
            >
              <Edit size={15} />
              Edit Profile
            </button>
          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4 text-xs font-medium text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-green-600 shrink-0" />
              <span>{user?.location || "Pune, Maharashtra"}</span>
            </div>

            {user?.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={15} className="text-green-600 shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar size={15} className="text-green-600 shrink-0" />
              <span>Joined {formattedJoinDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
