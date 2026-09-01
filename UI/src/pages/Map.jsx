import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import MapHero from "../components/map/MapHero";
import MapSidebar from "../components/map/MapSidebar";
import MapView from "../components/map/MapView";
import { BUSINESS_API_URL, ACTIVITY_API_URL } from "../config/api";

const MAP_FETCH_LIMIT = 1000;

// Haversine distance formula (in km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return Number(distance.toFixed(2));
};

function MapPage() {
  const [items, setItems] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const [search, setSearch] = useState("");
  const [distance, setDistance] = useState(0); // 0 = All radius
  const [category, setCategory] = useState("All");

  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle"); // 'idle' | 'locating' | 'granted' | 'denied' | 'unavailable'
  const [locationError, setLocationError] = useState("");

  const locationRequestedRef = useRef(false);

  // Request browser geolocation using native navigator.geolocation
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationStatus("locating");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLocation({ latitude, longitude });
        setLocating(false);
        setLocationStatus("granted");
        setLocationError("");

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geoData = await geoRes.json();
          setLocationName(
            geoData.address?.suburb ||
              geoData.address?.city ||
              geoData.address?.town ||
              "Your Current Location"
          );
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setLocationName("Your Current Location");
        }
      },
      (err) => {
        console.warn("Geolocation Error:", err.message);
        setLocating(false);

        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus("denied");
          setLocationError("Location permission is required to show your current location.");
        } else {
          setLocationStatus("unavailable");
          setLocationError("Your location could not be determined.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  };

  // Fetch real database businesses and activities from MongoDB APIs
  const fetchMapEntities = async () => {
    try {
      setLoading(true);

      const [businessRes, activityRes] = await Promise.allSettled([
        axios.get(`${BUSINESS_API_URL}?page=1&limit=${MAP_FETCH_LIMIT}&sort=newest`),
        axios.get(`${ACTIVITY_API_URL}?page=1&limit=${MAP_FETCH_LIMIT}`),
      ]);

      const validEntities = [];
      let skipped = 0;

      // 1. Process Real Businesses from MongoDB
      if (businessRes.status === "fulfilled" && businessRes.value.data?.businesses) {
        businessRes.value.data.businesses.forEach((biz) => {
          const lat = Number(biz.latitude);
          const lng = Number(biz.longitude);

          // Strictly require real, valid finite numeric coordinates
          if (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180 &&
            (lat !== 0 || lng !== 0)
          ) {
            validEntities.push({
              _id: biz._id || biz.id,
              id: biz._id || biz.id,
              itemType: "business",
              name: biz.name,
              category: biz.category || "Other",
              description: biz.description || "",
              address: biz.address || "",
              city: biz.city || "Pune",
              latitude: lat,
              longitude: lng,
              phone: biz.phone || "",
              email: biz.email || "",
              website: biz.website || "",
              image:
                biz.image && biz.image.trim() !== ""
                  ? biz.image
                  : "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
              rating: Number(biz.rating ?? 0),
              totalReviews: Number(biz.totalReviews ?? 0),
              isOpen: biz.isOpen ?? true,
              openingHours: biz.openingHours || "",
            });
          } else {
            skipped += 1;
          }
        });
      }

      // 2. Process Real Activities from MongoDB (Exclude Cancelled & Missing Coordinates)
      if (activityRes.status === "fulfilled" && activityRes.value.data?.activities) {
        activityRes.value.data.activities.forEach((act) => {
          if (act.status === "Cancelled") return;

          const lat = Number(act.latitude);
          const lng = Number(act.longitude);

          if (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180 &&
            (lat !== 0 || lng !== 0)
          ) {
            validEntities.push({
              _id: act._id || act.id,
              id: act._id || act.id,
              itemType: "activity",
              name: act.title,
              title: act.title,
              category: act.category || "Activity",
              description: act.description || "",
              address: act.location || "",
              city: act.city || "Pune",
              latitude: lat,
              longitude: lng,
              image:
                act.image && act.image.trim() !== ""
                  ? act.image
                  : "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600",
              date: act.date,
              startTime: act.startTime || "",
              endTime: act.endTime || "",
              participantCount: act.participants?.length || 0,
              maxParticipants: act.maxParticipants || 0,
            });
          } else {
            skipped += 1;
          }
        });
      }

      setItems(validEntities);
      setSkippedCount(skipped);
    } catch (error) {
      console.error("Fetch map entities error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapEntities();
  }, []);

  // Detect user location immediately on initial page load
  useEffect(() => {
    if (!locationRequestedRef.current) {
      locationRequestedRef.current = true;
      requestUserLocation();
    }
  }, []);

  // Filter items by Search, Category, and Distance
  const filteredItems = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return items
      .map((item) => {
        const dist =
          userLocation && item.latitude && item.longitude
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                item.latitude,
                item.longitude
              )
            : null;

        return {
          ...item,
          distance: dist,
        };
      })
      .filter((item) => {
        // Search Filter
        const itemName = (item.name || item.title || "").toLowerCase();
        const itemCategory = (item.category || "").toLowerCase();
        const itemAddress = (item.address || "").toLowerCase();
        const itemCity = (item.city || "").toLowerCase();

        const matchesSearch =
          searchTerm === "" ||
          itemName.includes(searchTerm) ||
          itemCategory.includes(searchTerm) ||
          itemAddress.includes(searchTerm) ||
          itemCity.includes(searchTerm);

        // Category / Type Filter
        let matchesCategory = true;
        if (category === "Businesses") {
          matchesCategory = item.itemType === "business";
        } else if (category === "Activities") {
          matchesCategory = item.itemType === "activity";
        } else if (category !== "All") {
          matchesCategory =
            item.category.toLowerCase() === category.toLowerCase();
        }

        // Distance Filter (if distance > 0 and userLocation is available)
        let matchesDistance = true;
        if (userLocation && distance > 0 && item.distance !== null) {
          matchesDistance = item.distance <= distance;
        }

        return matchesSearch && matchesCategory && matchesDistance;
      })
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [items, category, distance, search, userLocation]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <MapHero
        search={search}
        setSearch={setSearch}
        distance={distance}
        setDistance={setDistance}
        onLocateMe={requestUserLocation}
        locating={locating}
        locationName={locationName}
        category={category}
        setCategory={setCategory}
        totalCount={filteredItems.length}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-210px)] min-h-[550px]">
          {/* Left Sidebar List */}
          <div className="h-full overflow-hidden flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200/80">
            <MapSidebar
              items={filteredItems}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              category={category}
              setCategory={setCategory}
              userLocation={userLocation}
              locationName={locationName}
              loading={loading}
              skippedCount={skippedCount}
            />
          </div>

          {/* Right Map View */}
          <div className="h-full overflow-hidden rounded-3xl shadow-sm border border-slate-200/80 bg-white">
            <MapView
              items={filteredItems}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              userLocation={userLocation}
              onLocateMe={requestUserLocation}
              locating={locating}
              locationStatus={locationStatus}
              locationError={locationError}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default MapPage;
