import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import RecentActivity from "../components/profile/RecentActivity";
import MyBusinesses from "../components/profile/MyBusinesses";
import EditProfileModal from "../components/profile/EditProfileModal";
import { USER_API_URL } from "../config/api";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEdit, setOpenEdit] = useState(false);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(USER_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.user;
      setUser(userData);
      setStats(response.data.stats || {});
      setRecentActivities(response.data.recentActivities || []);

      // Sync with localStorage
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Fetch profile error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      setError(
        err.response?.data?.message || "Failed to load profile from database."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Loader2 size={36} className="animate-spin text-green-600 mb-3" />
          <p className="text-sm font-semibold text-slate-600">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-lg mx-auto flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Profile Load Error</h2>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-6 px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 pb-16 space-y-6">
        <ProfileHeader
          user={user}
          setOpenEdit={setOpenEdit}
          onPhotoUpdated={handleProfileUpdated}
        />

        <ProfileStats stats={stats} />

        <MyBusinesses />

        <RecentActivity activities={recentActivities} />

        {openEdit && (
          <EditProfileModal
            open={openEdit}
            setOpen={setOpenEdit}
            user={user}
            onSuccess={handleProfileUpdated}
          />
        )}
      </main>
    </div>
  );
}

export default Profile;
