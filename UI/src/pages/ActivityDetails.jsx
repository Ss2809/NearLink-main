import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  UserRoundCheck,
  LogOut,
  Edit3,
  Ban,
  Trash2,
  AlertTriangle,
  Mail,
  ShieldCheck,
  Loader2,
  Navigation,
  ExternalLink,
} from "lucide-react";
import EditActivityModal from "../components/Activity/EditActivityModal";
import { calculateDistance } from "./Map";
import Avatar from "../components/common/Avatar";
import { ACTIVITY_API_URL } from "../config/api";

// Fix default Leaflet icon assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const activityMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [removingUser, setRemovingUser] = useState(null);
  const [joined, setJoined] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState(null);

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

  // Check current user joined or not
  const checkJoinedStatus = (activityData) => {
    if (!currentUserId || !activityData?.participants) return false;

    return activityData.participants.some((participant) => {
      const pId = participant?._id || participant?.id || participant;
      return pId?.toString() === currentUserId.toString();
    });
  };

  // Fetch single activity
  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${ACTIVITY_API_URL}/${id}`);
      const activityData = response.data.activity;
      setActivity(activityData);
      setJoined(checkJoinedStatus(activityData));
    } catch (error) {
      setActivity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchActivity();
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

  // Compute distance when location or activity updates
  useEffect(() => {
    if (
      userLocation &&
      activity &&
      Number.isFinite(activity.latitude) &&
      Number.isFinite(activity.longitude)
    ) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        activity.latitude,
        activity.longitude
      );
      setDistanceKm(dist);
    }
  }, [userLocation, activity]);

  const handleDirections = () => {
    if (!activity) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activity.latitude},${activity.longitude}`;
    window.open(url, "_blank");
  };

  // Join Activity
  const handleJoinActivity = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to join the activity");
      navigate("/login");
      return;
    }

    if (activity?.status === "Cancelled") {
      toast.error("This activity has been cancelled");
      return;
    }

    try {
      setJoining(true);
      const response = await axios.post(
        `${ACTIVITY_API_URL}/${id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message || "Successfully joined the activity!");
      setJoined(true);
      if (response.data.activity) {
        setActivity(response.data.activity);
      } else {
        fetchActivity();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to join activity"
      );
    } finally {
      setJoining(false);
    }
  };

  // Withdraw Activity
  const handleWithdrawActivity = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      setWithdrawing(true);
      const response = await axios.post(
        `${ACTIVITY_API_URL}/${id}/withdraw`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        response.data.message || "Successfully withdrawn from activity"
      );
      setJoined(false);
      if (response.data.activity) {
        setActivity(response.data.activity);
      } else {
        fetchActivity();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to withdraw from activity"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  // Cancel Activity (Creator only)
  const handleCancelActivity = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setCancelling(true);
      const response = await axios.put(
        `${ACTIVITY_API_URL}/${id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        response.data.message || "Activity cancelled successfully"
      );
      setShowCancelConfirm(false);
      if (response.data.activity) {
        setActivity(response.data.activity);
      } else {
        fetchActivity();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to cancel activity"
      );
    } finally {
      setCancelling(false);
    }
  };

  // Remove Participant (Creator only)
  const handleRemoveParticipant = async (participantId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setRemovingUser(participantId);
      const response = await axios.delete(
        `${ACTIVITY_API_URL}/${id}/participants/${participantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        response.data.message || "Participant removed successfully"
      );
      setParticipantToRemove(null);
      if (response.data.activity) {
        setActivity(response.data.activity);
      } else {
        fetchActivity();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to remove participant"
      );
    } finally {
      setRemovingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white px-8 py-5 rounded-2xl shadow flex items-center gap-3">
          <Loader2 className="animate-spin text-green-600" size={24} />
          <p className="font-medium text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Activity Not Found</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          This activity may have been removed or does not exist.
        </p>
        <button
          onClick={() => navigate("/activities")}
          className="mt-5 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-sm"
        >
          Back to Activities
        </button>
      </div>
    );
  }

  const creatorId =
    activity.createdBy?._id || activity.createdBy?.id || activity.createdBy;
  const isCreator =
    currentUserId && creatorId && creatorId.toString() === currentUserId.toString();

  const participantCount = activity.participants?.length || 0;
  const maxParticipants = activity.maxParticipants || 0;
  const isCancelled = activity.status === "Cancelled";
  const isFull = maxParticipants > 0 && participantCount >= maxParticipants;
  const remainingSpots =
    maxParticipants > 0 ? Math.max(0, maxParticipants - participantCount) : null;

  const hasValidCoordinates =
    Number.isFinite(activity.latitude) &&
    Number.isFinite(activity.longitude) &&
    activity.latitude !== 0 &&
    activity.longitude !== 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Banner */}
      <div className="relative h-[240px] md:h-[300px]">
        <img
          src={
            activity.image ||
            "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200"
          }
          alt={activity.title || "Activity"}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Creator Toolbar (Top Right) */}
        {isCreator && (
          <div className="absolute top-5 right-5 flex items-center gap-2.5">
            {!isCancelled && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 px-3.5 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  <Edit3 size={16} className="text-green-600" />
                  Edit Activity
                </button>

                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-1.5 bg-red-500/90 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  <Ban size={16} />
                  Cancel Activity
                </button>
              </>
            )}

            {isCancelled && (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1">
                <Ban size={14} /> Cancelled
              </span>
            )}
          </div>
        )}

        {/* Title & Category */}
        <div className="absolute bottom-6 left-5 md:left-10 right-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-block bg-green-500 text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {activity.category || "General"}
            </span>

            {isCancelled && (
              <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Cancelled
              </span>
            )}

            {distanceKm !== null && (
              <span className="inline-block bg-white/90 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                📍 {distanceKm} km away
              </span>
            )}

            {isCreator && (
              <span className="inline-flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                <ShieldCheck size={13} /> Organizer
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mt-2.5">
            {activity.title}
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 space-y-6">
        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-sm">This activity has been cancelled</h3>
              <p className="text-xs text-red-600 mt-0.5">
                The organizer has cancelled this event. Joining is disabled.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: About, Location Map & Participants */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-7 border border-slate-100">
              <h2 className="text-xl font-bold text-gray-900">About this activity</h2>

              <p className="text-gray-600 leading-relaxed mt-3 whitespace-pre-wrap">
                {activity.description}
              </p>

              {/* Activity Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2.5 bg-green-100 text-green-600 rounded-lg shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Date</p>
                    <p className="font-semibold text-sm text-gray-800">
                      {activity.date
                        ? new Date(activity.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2.5 bg-green-100 text-green-600 rounded-lg shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Time</p>
                    <p className="font-semibold text-sm text-gray-800">
                      {activity.startTime || "N/A"}
                      {activity.endTime ? ` - ${activity.endTime}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2.5 bg-green-100 text-green-600 rounded-lg shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Location</p>
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {activity.location || "Location not specified"}
                    </p>
                    <p className="text-xs text-gray-500">{activity.city || ""}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2.5 bg-green-100 text-green-600 rounded-lg shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Capacity</p>
                    <p className="font-semibold text-sm text-gray-800">
                      {maxParticipants > 0
                        ? `${participantCount} / ${maxParticipants} participants`
                        : `${participantCount} (Unlimited spots)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                <Avatar
                  src={activity.createdBy?.avatar}
                  name={activity.createdBy?.fullName || "Creator"}
                  size="md"
                  border
                />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Activity organized by</p>
                  <p className="font-bold text-gray-900">
                    {activity.createdBy?.fullName || "Community Member"}
                    {isCreator && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* LOCATION ON MAP SECTION */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-7 border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={20} className="text-green-600" />
                    Activity Location & Directions
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.location}, {activity.city}
                  </p>
                </div>

                {hasValidCoordinates && (
                  <button
                    onClick={handleDirections}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto"
                  >
                    <ExternalLink size={14} /> Open Directions
                  </button>
                )}
              </div>

              {hasValidCoordinates ? (
                <div className="relative w-full h-[300px] rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
                  <MapContainer
                    center={[activity.latitude, activity.longitude]}
                    zoom={15}
                    className="w-full h-full"
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker
                      position={[activity.latitude, activity.longitude]}
                      icon={activityMarkerIcon}
                    >
                      <Popup>
                        <div className="p-1 text-xs">
                          <strong className="block font-bold text-slate-900">{activity.title}</strong>
                          <span className="text-gray-500">{activity.location}</span>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-gray-400">
                  <MapPin size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-600">Coordinates not specified</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.location}, {activity.city}</p>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* PARTICIPANTS LIST & CREATOR MANAGEMENT */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-7 border border-slate-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users size={20} className="text-green-600" />
                    Enrolled Participants ({participantCount})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isCreator
                      ? "Manage enrolled community members"
                      : "See who else is joining this activity"}
                  </p>
                </div>
              </div>

              {/* Participant Cards */}
              <div className="mt-5">
                {participantCount === 0 ? (
                  <div className="text-center py-10 px-4 bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-2">
                      <Users size={22} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No participants yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isCreator
                        ? "When community members join your activity, they will be listed here."
                        : "Be the first to join this activity!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    {activity.participants.map((participant) => {
                      const pId = (participant?._id || participant?.id || participant)?.toString();
                      const pName = participant?.fullName || "Participant";
                      const pEmail = participant?.email || "";
                      const isMe = currentUserId && pId === currentUserId.toString();
                      const isRemoving = removingUser === pId;

                      return (
                        <div
                          key={pId}
                          className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/80 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              src={participant?.avatar}
                              name={pName}
                              size="md"
                              className="shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1.5">
                                {pName}
                                {isMe && (
                                  <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.2 rounded-md">
                                    You
                                  </span>
                                )}
                              </p>
                              {pEmail && (
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                  <Mail size={12} className="shrink-0 text-gray-400" />
                                  {pEmail}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Creator Action: Remove Participant */}
                          {isCreator && (
                            <button
                              onClick={() => setParticipantToRemove(participant)}
                              disabled={isRemoving}
                              className="ml-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition shrink-0"
                              title="Remove Participant"
                            >
                              {isRemoving ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR / JOIN ACTIONS */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 lg:sticky lg:top-5">
              <h3 className="text-xl font-bold text-gray-900">
                {isCreator
                  ? "Organizer Panel"
                  : joined
                  ? "You're attending!"
                  : "Join this activity"}
              </h3>

              {/* Status Box */}
              <div className="mt-4 p-4 bg-green-50/70 border border-green-100 rounded-xl">
                <div className="flex items-center gap-2 text-green-800">
                  <Users size={18} />
                  <span className="font-bold text-sm">
                    {participantCount} {participantCount === 1 ? "participant" : "participants"}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-2">
                  {maxParticipants === 0
                    ? "Unlimited spots available"
                    : remainingSpots > 0
                    ? `${remainingSpots} spot${remainingSpots > 1 ? "s" : ""} remaining`
                    : "Activity capacity is full"}
                </p>
              </div>

              {/* Action Buttons for Normal Participants */}
              {!isCreator && !isCancelled && (
                <>
                  {joined ? (
                    <>
                      <div className="mt-4 flex items-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold">
                        <UserRoundCheck size={18} />
                        You have joined this activity
                      </div>

                      <button
                        onClick={handleWithdrawActivity}
                        disabled={withdrawing}
                        className="w-full mt-3 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                      >
                        <LogOut size={16} />
                        {withdrawing ? "Withdrawing..." : "Withdraw from Activity"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleJoinActivity}
                      disabled={joining || isFull}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joining
                        ? "Joining..."
                        : isFull
                        ? "Activity Full"
                        : "Join Activity"}
                    </button>
                  )}
                </>
              )}

              {/* Creator Management Actions Box */}
              {isCreator && (
                <div className="mt-5 space-y-2.5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Manage Activity
                  </p>

                  {!isCancelled ? (
                    <>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-2xs"
                      >
                        <Edit3 size={16} />
                        Edit Activity Details
                      </button>

                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm font-semibold transition"
                      >
                        <Ban size={16} />
                        Cancel Activity
                      </button>
                    </>
                  ) : (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium text-center border border-red-200">
                      This activity has been cancelled.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Activity Modal */}
      {showEditModal && activity && (
        <EditActivityModal
          activity={activity}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setActivity(updated);
          }}
        />
      )}

      {/* Cancel Activity Confirmation Modal */}
      {showCancelConfirm && activity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-red-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900">Cancel this Activity?</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Are you sure you want to cancel <strong>"{activity.title}"</strong>? All {participantCount} enrolled participant(s) will be notified immediately.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                Keep Activity
              </button>
              <button
                type="button"
                onClick={handleCancelActivity}
                disabled={cancelling}
                className="px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Activity"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Participant Confirmation Modal */}
      {participantToRemove && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900">Remove Participant?</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Remove <strong>{participantToRemove.fullName || "this participant"}</strong> from <strong>"{activity.title}"</strong>? They will receive a notification.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setParticipantToRemove(null)}
                disabled={removingUser !== null}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRemoveParticipant(
                    participantToRemove._id || participantToRemove.id
                  )
                }
                disabled={removingUser !== null}
                className="px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {removingUser ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityDetails;