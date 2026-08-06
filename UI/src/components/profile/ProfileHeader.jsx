import { MapPin, Calendar, Edit } from "lucide-react";

function ProfileHeader({ setOpenEdit }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white rounded-3xl shadow-md p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Avatar */}

        <img
          src={
            user?.avatar ||
            `https://api.dicebear.com/10.x/toon-head/png?seed=${user?.fullName}`
          }
          alt=""
          className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-lg"
        />

        {/* User Details */}

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold text-slate-800">
            {user?.fullName}
          </h1>

          <p className="text-gray-500 mt-2">{user?.email}</p>

          <div className="flex flex-col md:flex-row gap-6 mt-5 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-green-500" />
              Wagholi, Pune
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-green-500" />
              Joined August 2026
            </div>
          </div>

          <button
            onClick={() => setOpenEdit(true)}
            className="mt-6 bg-green-500 hover:bg-green-600 transition text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Edit size={18} />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
