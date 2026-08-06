import {
  Coffee,
  Dumbbell,
  Calendar,
  Plus,
  Minus,
  LocateFixed,
  MapPin,
  Star,
} from "lucide-react";
import { useMap } from "react-leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
function FlyToLocation({ selectedBusiness }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedBusiness) return;

    map.flyTo([selectedBusiness.latitude, selectedBusiness.longitude], 16, {
      animate: true,
      duration: 1.5,
    });
  }, [selectedBusiness]);

  return null;
}

function Routing({ userLocation, selectedBusiness }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !selectedBusiness) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.latitude, userLocation.longitude),
        L.latLng(selectedBusiness.latitude, selectedBusiness.longitude),
      ],
      lineOptions: {
        styles: [{ color: "#16a34a", weight: 5 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
    }).addTo(map);

    return () => {
      try {
        routingControl?.remove();
      } catch (err) {
        console.log("Routing cleanup:", err);
      }
    };
  }, [userLocation, selectedBusiness, map]);

  return null;
}
function OpenSelectedPopup({ selectedBusiness, markerRefs }) {
  useEffect(() => {
    if (!selectedBusiness) return;

    const marker = markerRefs.current[selectedBusiness._id || selectedBusiness.id];

    if (marker) {
      marker.openPopup();
    }
  }, [selectedBusiness]);

  return null;
}

function MapView({
  businesses,
  selectedBusiness,
  setSelectedBusiness,
  userLocation,
}) {
  const fallbackLocation = { latitude: 40.7128, longitude: -74.006 }; 
  const locationToUse = userLocation || fallbackLocation;
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const invalidateMap = () => mapRef.current?.invalidateSize();
    const timer = window.setTimeout(invalidateMap, 0);

    window.addEventListener("resize", invalidateMap);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", invalidateMap);
    };
  }, [locationToUse.latitude, locationToUse.longitude]);

  // ---------- Custom Icon ----------
  const createIcon = (Icon, bgColor) =>
    L.divIcon({
      html: renderToStaticMarkup(
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: bgColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            border: "3px solid white",
            boxShadow: "0 4px 10px rgba(0,0,0,.3)",
          }}
        >
          <Icon size={20} />
        </div>,
      ),
      className: "",
      iconSize: [42, 42],
      iconAnchor: [21, 42],
      popupAnchor: [0, -40],
    });

  // ---------- Icons ---

  const userIcon = createIcon(LocateFixed, "#2563eb");

  const cafeIcon = createIcon(Coffee, "#16a34a");

  const gymIcon = createIcon(Dumbbell, "#9333ea");

  const activityIcon = createIcon(Calendar, "#f97316");

  // ---------- User Location ----------

  const markerRefs = useRef({});
  const handleDirections = () => {
    if (!selectedBusiness) return;

    const userLat = locationToUse.latitude;
    const userLng = locationToUse.longitude;

    const destinationLat = selectedBusiness.latitude;
    const destinationLng = selectedBusiness.longitude;

    const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${destinationLat},${destinationLng}`;

    window.open(url, "_blank");
  };
  return (
    <div className="relative flex-1 rounded-2xl overflow-hidden shadow-md min-h-[420px]">
      {!userLocation && (
        <div className="absolute left-3 top-3 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-sm shadow-md">
          Using a default location while GPS is unavailable.
        </div>
      )}

      <div className="w-full h-[420px] md:h-[560px] rounded-xl overflow-hidden">
        <MapContainer
          ref={mapRef}
          center={[locationToUse.latitude, locationToUse.longitude]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToLocation selectedBusiness={selectedBusiness} />
          <Routing
            userLocation={locationToUse}
            selectedBusiness={selectedBusiness}
          />
          <OpenSelectedPopup
            selectedBusiness={selectedBusiness}
            markerRefs={markerRefs}
          />

          {/* User Marker */}

          {locationToUse && (
            <Marker
              position={[locationToUse.latitude, locationToUse.longitude]}
              icon={userIcon}
            >
              <Popup>You are here 📍</Popup>
            </Marker>
          )}

          {/* Business Markers */}

          {businesses.map((business) => (
            <Marker
              key={business._id || business.id}
              position={[business.latitude, business.longitude]}
              icon={
                business.category === "Cafe"
                  ? cafeIcon
                  : business.category === "Gym"
                    ? gymIcon
                    : activityIcon
              }
              ref={(ref) => {
                markerRefs.current[business._id || business.id] = ref;
              }}
              eventHandlers={{
                click: () => {
                  setSelectedBusiness(business);
                },
              }}
            >
              <Popup>
                <div className="w-52">
                  <img
                    src={business.image}
                    alt={business.name}
                    className="w-full h-28 object-cover rounded-lg"
                  />

                  <h2 className="font-bold mt-2">{business.name}</h2>

                  <p className="text-sm text-gray-500">{business.category}</p>

                  <p className="text-sm mt-1">{business.address}</p>

                  <p className="text-green-600 font-medium mt-2">
                    ⭐ {business.rating}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {/* Details Card */}

      <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl p-5 max-w-85">
        <div className="flex gap-4">
          <img
            src={selectedBusiness?.image}
            alt={selectedBusiness?.name}
            className="w-24 h-24 rounded-xl object-cover shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold truncate">
                {selectedBusiness?.name}
              </h2>

              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                {selectedBusiness?.isOpen ? "Open" : "Closed"}
              </span>
            </div>

            <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              {selectedBusiness?.totalReviews}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {selectedBusiness?.category}
            </p>

            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {selectedBusiness?.address}
            </p>

            <p className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <MapPin size={14} />
              {selectedBusiness?.city}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button className="flex-1 border-2 border-green-500 text-green-600 rounded-xl py-3 hover:bg-green-500 hover:text-white transition">
            View Details
          </button>

          <button
            onClick={handleDirections}
            className="flex-1 bg-green-500 text-white rounded-xl py-3 hover:bg-green-600 transition"
          >
            Directions
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapView;
