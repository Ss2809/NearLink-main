import { X, User, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { Camera } from "lucide-react";
function EditProfileModal({ open, setOpen }) {
 
  if (!open) return null;

  const user = JSON.parse(localStorage.getItem("user"));
 const [preview, setPreview] = useState(user?.avatar || "");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [location, setLocation] = useState("Wagholi, Pune");

  const handleSave = () => {
    const updatedUser = {
  ...user,
  fullName,
  email,
  avatar: preview,
};

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setOpen(false);

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-xl p-8">
        {/* Header */}

        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Edit Profile</h2>

          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* Avatar */}

        <div className="flex justify-center mt-8">
          <div className="relative">
            <img
              src={
                preview ||
                `https://api.dicebear.com/10.x/toon-head/png?seed=${fullName}`
              }
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-green-500"
            />

            <label
              htmlFor="avatar"
              className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full cursor-pointer"
            >
              <Camera className="text-white" size={18} />
            </label>

            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];

                if (!file) return;

                const imageUrl = URL.createObjectURL(file);

                setPreview(imageUrl);
              }}
            />
          </div>
        </div>

        {/* Full Name */}

        <div className="mt-8">
          <label className="font-semibold">Full Name</label>

          <div className="flex items-center border rounded-xl mt-2 px-4 h-14">
            <User className="text-gray-500" />

            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="ml-3 flex-1 outline-none"
            />
          </div>
        </div>

        {/* Email */}

        <div className="mt-5">
          <label className="font-semibold">Email</label>

          <div className="flex items-center border rounded-xl mt-2 px-4 h-14">
            <Mail className="text-gray-500" />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ml-3 flex-1 outline-none"
            />
          </div>
        </div>

        {/* Location */}

        <div className="mt-5">
          <label className="font-semibold">Location</label>

          <div className="flex items-center border rounded-xl mt-2 px-4 h-14">
            <MapPin className="text-gray-500" />

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="ml-3 flex-1 outline-none"
            />
          </div>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => setOpen(false)}
            className="border px-6 py-3 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
