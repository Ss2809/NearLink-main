import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Store,
  Navigation,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  LocateFixed,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Fix default Leaflet icon assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Category definition registry with colors & symbols
export const CATEGORY_STYLES = {
  cafe: { label: "Cafe", bg: "#f59e0b", icon: "☕", textColor: "text-amber-600" },
  restaurant: { label: "Restaurant", bg: "#ea580c", icon: "🍴", textColor: "text-orange-600" },
  gym: { label: "Gym & Fitness", bg: "#8b5cf6", icon: "🏋️", textColor: "text-purple-600" },
  hospital: { label: "Hospital", bg: "#dc2626", icon: "🏥", textColor: "text-red-600" },
  medical: { label: "Medical / Pharmacy", bg: "#e11d48", icon: "💊", textColor: "text-rose-600" },
  hotel: { label: "Hotel", bg: "#4f46e5", icon: "🏨", textColor: "text-indigo-600" },
  shop: { label: "Shop & Retail", bg: "#10b981", icon: "🛍️", textColor: "text-emerald-600" },
  salon: { label: "Salon & Beauty", bg: "#db2777", icon: "💇", textColor: "text-pink-600" },
  education: { label: "Education", bg: "#0284c7", icon: "🎓", textColor: "text-sky-600" },
  other: { label: "Other Business", bg: "#475569", icon: "🏬", textColor: "text-slate-600" },
  activity: { label: "Activity / Event", bg: "#06b6d4", icon: "📅", textColor: "text-cyan-600" },
};

// Component to control initial camera position & smooth navigation
function MapCameraController({ userLocation, items, selectedItem }) {
  const map = useMap();
  const initialPositionSet = useRef(false);

  useEffect(() => {
    // 1. If an item is explicitly selected, fly to it
    if (selectedItem) {
      map.flyTo([selectedItem.latitude, selectedItem.longitude], 15, {
        duration: 1.2,
      });
      return;
    }

    // 2. FIRST PRIORITY: If user location is obtained, center on user first!
    if (userLocation && Number.isFinite(userLocation.latitude) && Number.isFinite(userLocation.longitude)) {
      if (!initialPositionSet.current) {
        map.flyTo([userLocation.latitude, userLocation.longitude], 14, {
          duration: 1.5,
        });
        initialPositionSet.current = true;
      }
      return;
    }

    // 3. Fallback: If user location is unavailable/denied, fit bounds to database businesses
    if (!initialPositionSet.current && items && items.length > 0) {
      const validPoints = items
        .filter((i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude))
        .map((i) => [i.latitude, i.longitude]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        initialPositionSet.current = true;
      }
    }
  }, [userLocation, selectedItem, items, map]);

  return null;
}

// Custom Distinct User Location Marker ("You are here")
const createUserLocationIcon = () =>
  L.divIcon({
    className: "custom-user-location-marker",
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: pulse 2s infinite;"></div>
        <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.6); border: 3px solid white;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: white;"></div>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });

// Category-based marker factory for businesses & activities
const getCategoryMarkerIcon = (item) => {
  if (item.itemType === "activity") {
    const conf = CATEGORY_STYLES.activity;
    return L.divIcon({
      className: "custom-category-marker",
      html: `
        <div style="position: relative; width: 36px; height: 44px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 34px; height: 34px; border-radius: 50%; background: ${conf.bg}; color: white; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2.5px solid white;">
            ${conf.icon}
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${conf.bg}; margin-top: -2px;"></div>
        </div>
      `,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -42],
    });
  }

  const catLower = (item.category || "").toLowerCase();
  let conf = CATEGORY_STYLES.other;

  if (catLower === "cafe") conf = CATEGORY_STYLES.cafe;
  else if (catLower === "restaurant") conf = CATEGORY_STYLES.restaurant;
  else if (catLower === "gym") conf = CATEGORY_STYLES.gym;
  else if (catLower === "hospital") conf = CATEGORY_STYLES.hospital;
  else if (catLower === "medical") conf = CATEGORY_STYLES.medical;
  else if (catLower === "hotel") conf = CATEGORY_STYLES.hotel;
  else if (catLower === "shop") conf = CATEGORY_STYLES.shop;
  else if (catLower === "salon") conf = CATEGORY_STYLES.salon;
  else if (catLower === "education") conf = CATEGORY_STYLES.education;

  return L.divIcon({
    className: "custom-category-marker",
    html: `
      <div style="position: relative; width: 36px; height: 44px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="width: 34px; height: 34px; border-radius: 50%; background: ${conf.bg}; color: white; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2.5px solid white;">
          ${conf.icon}
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${conf.bg}; margin-top: -2px;"></div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42],
  });
};

function MapView({
  items = [],
  selectedItem,
  setSelectedItem,
  userLocation,
  onLocateMe,
  locating,
  locationStatus,
  locationError,
  loading,
}) {
  const navigate = useNavigate();
  const markerRefs = useRef({});
  const userMarkerRef = useRef(null);
  const [showLegend, setShowLegend] = useState(true);
  const [dismissNotice, setDismissNotice] = useState(false);

  // Default Pune coordinates
  const defaultCenter = [18.5204, 73.8567];

  useEffect(() => {
    if (selectedItem) {
      const key = selectedItem._id || selectedItem.id;
      const marker = markerRefs.current[key];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedItem]);

  // Open user popup when location is obtained
  useEffect(() => {
    if (userLocation && userMarkerRef.current && !selectedItem) {
      userMarkerRef.current.openPopup();
    }
  }, [userLocation, selectedItem]);

  const handleDirections = (lat, lng) => {
    if (!lat || !lng) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        center={
          userLocation && Number.isFinite(userLocation.latitude)
            ? [userLocation.latitude, userLocation.longitude]
            : defaultCenter
        }
        zoom={13}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCameraController
          userLocation={userLocation}
          items={items}
          selectedItem={selectedItem}
        />

        {/* ========================================================= */}
        {/* DISTINCT USER LOCATION MARKER ("You are here") */}
        {/* ========================================================= */}
        {userLocation && Number.isFinite(userLocation.latitude) && Number.isFinite(userLocation.longitude) && (
          <>
            {/* Visual radius around user location */}
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={450}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.12,
                weight: 1.5,
              }}
            />

            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserLocationIcon()}
              ref={userMarkerRef}
            >
              <Popup>
                <div className="p-1.5 text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1 font-bold text-sm">
                    📍
                  </div>
                  <strong className="block font-bold text-sm text-blue-600">
                    You are here
                  </strong>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This is your current detected location
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* ========================================================= */}
        {/* DATABASE BUSINESS & ACTIVITY MARKERS */}
        {/* ========================================================= */}
        {items.map((item) => {
          if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) {
            return null;
          }

          const key = item._id || item.id;
          const isBusiness = item.itemType === "business";
          const detailsUrl = isBusiness ? `/business/${key}` : `/activity/${key}`;

          return (
            <Marker
              key={key}
              position={[item.latitude, item.longitude]}
              icon={getCategoryMarkerIcon(item)}
              ref={(ref) => {
                markerRefs.current[key] = ref;
              }}
              eventHandlers={{
                click: () => setSelectedItem(item),
              }}
            >
              <Popup>
                <div className="w-56 p-1">
                  <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                    <img
                      src={
                        item.image ||
                        (isBusiness
                          ? "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"
                          : "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400")
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs ${
                        isBusiness ? "bg-green-600" : "bg-purple-600"
                      }`}
                    >
                      {isBusiness ? item.category : "Activity"}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {item.address}, {item.city}
                  </p>

                  {/* Rating / Timing */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                    {isBusiness ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        ⭐ {item.rating || 0}
                      </span>
                    ) : (
                      <span className="text-purple-700 font-semibold flex items-center gap-1">
                        <Clock size={12} /> {item.startTime || "Upcoming"}
                      </span>
                    )}

                    <button
                      onClick={() => navigate(detailsUrl)}
                      className="text-green-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ========================================================= */}
      {/* FLOATING "LOCATE ME" BUTTON DIRECTLY ON MAP */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-14 z-10">
        <button
          type="button"
          onClick={onLocateMe}
          disabled={locating}
          className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 hover:text-blue-600 px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 text-xs font-bold transition backdrop-blur-md"
          title="Center on my current location"
        >
          {locating ? (
            <Loader2 size={14} className="animate-spin text-blue-600" />
          ) : (
            <LocateFixed size={14} className="text-blue-600" />
          )}
          <span>{locating ? "Locating..." : "Locate Me"}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* PERMISSION / LOCATION NOTICE BANNER (If Denied) */}
      {/* ========================================================= */}
      {locationStatus === "denied" && !dismissNotice && (
        <div className="absolute top-4 left-44 right-64 z-10 hidden md:block">
          <div className="bg-amber-50/95 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0" />
              <span>Location permission is required to show your current location. You can still browse all businesses.</span>
            </div>
            <button
              onClick={() => setDismissNotice(true)}
              className="p-1 text-amber-500 hover:text-amber-800 ml-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAP LEGEND (Top Right) */}
      {/* ========================================================= */}
      <div className="absolute top-4 right-4 z-10 hidden sm:block">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden max-w-[210px] transition-all">
          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
          >
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-green-600" /> Map Categories
            </span>
            {showLegend ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showLegend && (
            <div className="p-3 space-y-1.5 max-h-[260px] overflow-y-auto text-[11px] font-medium text-slate-700">
              <div className="flex items-center gap-2 font-bold text-blue-600 pb-1 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-[10px] shadow-2xs">📍</span>
                <span>You are here</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#f59e0b] text-white flex items-center justify-center text-[10px] shadow-2xs">☕</span>
                <span>Cafe</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#ea580c] text-white flex items-center justify-center text-[10px] shadow-2xs">🍴</span>
                <span>Restaurant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center text-[10px] shadow-2xs">🏋️</span>
                <span>Gym & Fitness</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center text-[10px] shadow-2xs">🏥</span>
                <span>Hospital</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#e11d48] text-white flex items-center justify-center text-[10px] shadow-2xs">💊</span>
                <span>Medical / Pharmacy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-[10px] shadow-2xs">🏨</span>
                <span>Hotel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[10px] shadow-2xs">🛍️</span>
                <span>Shop / Shopping</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#db2777] text-white flex items-center justify-center text-[10px] shadow-2xs">💇</span>
                <span>Salon</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[10px] shadow-2xs">🎓</span>
                <span>Education</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#06b6d4] text-white flex items-center justify-center text-[10px] shadow-2xs">📅</span>
                <span>Activity / Event</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Selected Entity Card */}
      {selectedItem && (
        <div className="absolute bottom-5 left-5 right-5 md:right-auto md:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-slate-200 z-10 animate-fade-in">
          <div className="flex gap-3.5 items-start">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              <img
                src={
                  selectedItem.image ||
                  (selectedItem.itemType === "business"
                    ? "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"
                    : "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400")
                }
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-xs ${
                  selectedItem.itemType === "business"
                    ? "bg-green-600"
                    : "bg-purple-600"
                }`}
              >
                {selectedItem.itemType === "business" ? selectedItem.category : "Activity"}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {selectedItem.name}
                </h3>
                {selectedItem.distance !== null && (
                  <span className="text-[11px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded shrink-0">
                    {selectedItem.distance} km
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {selectedItem.address}, {selectedItem.city}
              </p>

              {/* Extra Details */}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-[11px]">
                  {selectedItem.category}
                </span>

                {selectedItem.itemType === "business" && (
                  <span className="text-amber-600 font-bold flex items-center gap-0.5">
                    ⭐ {selectedItem.rating || 0}
                  </span>
                )}

                {selectedItem.itemType === "activity" && selectedItem.startTime && (
                  <span className="text-purple-700 font-semibold flex items-center gap-1">
                    <Clock size={12} /> {selectedItem.startTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mt-3.5 pt-3 border-t border-slate-100">
            <button
              onClick={() =>
                navigate(
                  selectedItem.itemType === "business"
                    ? `/business/${selectedItem._id || selectedItem.id}`
                    : `/activity/${selectedItem._id || selectedItem.id}`
                )
              }
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition text-center"
            >
              View Full Details
            </button>

            <button
              onClick={() =>
                handleDirections(
                  selectedItem.latitude,
                  selectedItem.longitude
                )
              }
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2.5 rounded-xl transition text-center flex items-center justify-center gap-1.5"
            >
              <Navigation size={13} /> Get Directions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
