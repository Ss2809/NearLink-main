import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import MapHero from "../components/map/MapHero";
import MapSidebar from "../components/map/MapSidebar";
import MapView from "../components/map/MapView";

const BUSINESS_API_URL = "http://localhost:3000/api/business";
const OVERPASS_API_URL = "https://overpass.kumi.systems/api/interpreter";

const normalizeCategory = (value = "Other") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "Other";

const getBusinessKey = (business) => business?._id || business?.id;

const normalizeMongoBusiness = (business) => ({
  ...business,
  _id: business._id,
  id: business._id,
  category: normalizeCategory(business.category),
  latitude: Number(business.latitude),
  longitude: Number(business.longitude),
  image:
    business.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
  rating: Number(business.rating ?? 0),
  totalReviews: Number(business.totalReviews ?? 0),
  isOpen: business.isOpen ?? true,
});

const fallbackLocation = {
  latitude: 40.7128,
  longitude: -74.006,
};

const normalizeNearbyBusiness = (place) => {
  const rawCategory =
    place.tags.amenity || place.tags.shop || place.tags.tourism || "Other";

  return {
    id: `osm-${place.id}`,
    name: place.tags.name,
    category: normalizeCategory(rawCategory),
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    address: place.tags["addr:street"] || place.tags["addr:full"] || "Nearby",
    city: place.tags["addr:city"] || "Nearby",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
    rating: 0,
    totalReviews: 0,
    isOpen: true,
  };
};

function MapPage() {
  const [mongoBusinesses, setMongoBusinesses] = useState([]);
  const [nearbyBusinesses, setNearbyBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [search, setSearch] = useState("");
  const [distance, setDistance] = useState(2);
  const [category, setCategory] = useState("All");

  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("");

  const locationRequestedRef = useRef(false);
  const mongoRequestedRef = useRef(false);

  const fetchMongoBusinesses = async () => {
    const response = await axios.get(BUSINESS_API_URL);
    return (response.data.businesses || []).map(normalizeMongoBusiness);
  };

  const fetchNearbyPlaces = async (lat, lon, radiusKm) => {
    const query = `
[out:json][timeout:25];
(
  node["amenity"~"cafe|restaurant|hospital|pharmacy"](around:${radiusKm * 1000},${lat},${lon});
  way["amenity"~"cafe|restaurant|hospital|pharmacy"](around:${radiusKm * 1000},${lat},${lon});
  relation["amenity"~"cafe|restaurant|hospital|pharmacy"](around:${radiusKm * 1000},${lat},${lon});
);
out center;
`;

    try {
      const response = await fetch(OVERPASS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Accept: "application/json",
        },
        body: query,
      });

      const bodyText = await response.text();

      if (!response.ok) {
        console.log("Overpass Error:", response.status, bodyText);
        return [];
      }

      let data;

      try {
        data = JSON.parse(bodyText);
      } catch (parseError) {
        console.log("Overpass JSON Parse Error:", parseError, bodyText);
        return [];
      }

      return (data.elements || [])
        .filter((place) => place.tags?.name)
        .slice(0, 15)
        .map((place) => {
          const latitude = Number(place.lat ?? place.center?.lat);
          const longitude = Number(place.lon ?? place.center?.lon);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          return normalizeNearbyBusiness({
            ...place,
            lat: latitude,
            lon: longitude,
          });
        })
        .filter(Boolean);
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  useEffect(() => {
    if (mongoRequestedRef.current) {
      return;
    }

    mongoRequestedRef.current = true;
    let cancelled = false;

    const loadMongoBusinesses = async () => {
      try {
        const businesses = await fetchMongoBusinesses();

        if (!cancelled) {
          setMongoBusinesses(businesses);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadMongoBusinesses();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    console.log("useEffect Started");
    if (locationRequestedRef.current) {
      return;
    }

    locationRequestedRef.current = true;

    let cancelled = false;

    if (!navigator.geolocation) {
      setUserLocation(fallbackLocation);
      setLocationName("Using default location");
      return undefined;
    }
     console.log("useEffect Started");
  navigator.geolocation.getCurrentPosition(
  async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    setUserLocation({
      latitude,
      longitude,
    });

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      const geoData = await geoRes.json();

      console.log("Reverse Geo:", geoData);

      setLocationName(
        geoData.address?.suburb ||
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.village ||
          "My Location"
      );
    } catch (err) {
      console.log(err);
      setLocationName("My Location");
    }
  },
  (err) => {
    console.log("Geolocation Error:", err);
    setUserLocation(fallbackLocation);
    setLocationName("Using default location");
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  }
);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userLocation) {
      return;
    }

    let cancelled = false;

    const loadNearbyBusinesses = async () => {
      const businesses = await fetchNearbyPlaces(
        userLocation.latitude,
        userLocation.longitude,
        distance,
      );

      if (!cancelled) {
        setNearbyBusinesses(businesses);
      }
    };

    loadNearbyBusinesses();

    return () => {
      cancelled = true;
    };
  }, [userLocation, distance]);

  const businesses = useMemo(() => {
    const mergedBusinesses = new Map();

    [...mongoBusinesses, ...nearbyBusinesses].forEach((business) => {
      const key = getBusinessKey(business);

      if (key) {
        mergedBusinesses.set(key, business);
      }
    });

    return Array.from(mergedBusinesses.values());
  }, [mongoBusinesses, nearbyBusinesses]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const filteredBusinesses = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const businessCategories = new Set([
      "Cafe",
      "Restaurant",
      "Gym",
      "Hospital",
      "Medical",
      "Salon",
      "Hotel",
      "Shop",
      "Education",
      "Other",
      "Pharmacy",
    ]);
    const activityCategories = new Set(["Activity", "Event", "Sports"]);

    return businesses.filter((business) => {
      const businessName = (business.name || "").toLowerCase();
      const businessCategory = (business.category || "").toLowerCase();
      const businessAddress = (business.address || "").toLowerCase();
      const businessCity = (business.city || "").toLowerCase();

      const matchesSearch =
        searchTerm === "" ||
        businessName.includes(searchTerm) ||
        businessCategory.includes(searchTerm) ||
        businessAddress.includes(searchTerm) ||
        businessCity.includes(searchTerm);

      const matchesCategory =
        category === "All" ||
        (category === "Businesses" && businessCategories.has(business.category)) ||
        (category === "Activities" && activityCategories.has(business.category));

      const hasValidCoordinates =
        Number.isFinite(business.latitude) && Number.isFinite(business.longitude);

      const matchesDistance =
        !userLocation ||
        !hasValidCoordinates ||
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          business.latitude,
          business.longitude,
        ) <= distance;

      return matchesSearch && matchesCategory && matchesDistance;
    });
  }, [businesses, category, distance, search, userLocation]);

  useEffect(() => {
    if (filteredBusinesses.length === 0) {
      if (selectedBusiness !== null) {
        setSelectedBusiness(null);
      }

      return;
    }

    const selectedKey = getBusinessKey(selectedBusiness);
    const stillVisible = filteredBusinesses.some(
      (business) => getBusinessKey(business) === selectedKey,
    );

    if (!selectedBusiness || !stillVisible) {
      setSelectedBusiness(filteredBusinesses[0]);
    }
  }, [filteredBusinesses, selectedBusiness]);

  return (
    <> 
    
      <Navbar />
      <MapHero
        search={search}
        setSearch={setSearch}
        distance={distance}
        setDistance={setDistance}
        category={category}
        setCategory={setCategory}
      />

      <section className="max-w-375 mx-auto px-6 py-4 h-[calc(100vh-140px)]">
        <div className="flex gap-6 h-full overflow-hidden">
          <div className="w-90 h-full overflow-y-auto">
            <MapSidebar
              businesses={filteredBusinesses}
              selectedBusiness={selectedBusiness}
              setSelectedBusiness={setSelectedBusiness}
              category={category}
              setCategory={setCategory}
              userLocation={userLocation}
              locationName={locationName}
            />
          </div>

          <MapView
            businesses={filteredBusinesses}
            selectedBusiness={selectedBusiness}
            setSelectedBusiness={setSelectedBusiness}
            userLocation={userLocation}
          />
        </div>
      </section>
    </>
  );
}

export default MapPage;
