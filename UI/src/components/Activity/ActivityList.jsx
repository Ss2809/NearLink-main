import { useEffect, useState } from "react";
import axios from "axios";

import ActivityCard from "./ActivityCard1";
import { ACTIVITY_API_URL } from "../../config/api";

function ActivityList({
  refreshActivities,
  activeTab,
  search,
  location,
  category,
  date,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivities = async (pageNumber = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(
        `${ACTIVITY_API_URL}?page=${pageNumber}&limit=5`,
      );

      const newActivities = response.data.activities || [];

      if (append) {
        setActivities((prev) => [
          ...prev,
          ...newActivities,
        ]);
      } else {
        setActivities(newActivities);
      }

      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log("Error fetching activities:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // First 5 activities
  useEffect(() => {
    setPage(1);
    fetchActivities(1, false);
  }, [refreshActivities]);

  const handleLoadMore = () => {
    const nextPage = page + 1;

    fetchActivities(nextPage, true);
    setPage(nextPage);
  };

  // Get current user ID
  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?._id || user?.id || null;
    } catch (error) {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  const filteredActivities = activities.filter((activity) => {
    // MY ACTIVITIES
    if (activeTab === "my") {
      const creatorId =
        activity.createdBy?._id || activity.createdBy;

      if (
        !currentUserId ||
        String(creatorId) !== String(currentUserId)
      ) {
        return false;
      }
    }

    // JOINED ACTIVITIES
    if (activeTab === "joined") {
      const isJoined = activity.participants?.some(
        (participant) => {
          const participantId =
            participant?._id || participant;

          return (
            currentUserId &&
            String(participantId) === String(currentUserId)
          );
        },
      );

      if (!isJoined) {
        return false;
      }
    }

    // SEARCH
    if (search) {
      const text = search.toLowerCase();

      const matchesSearch =
        activity.title?.toLowerCase().includes(text) ||
        activity.description?.toLowerCase().includes(text);

      if (!matchesSearch) return false;
    }

    // LOCATION
    if (location) {
      const text = location.toLowerCase();

      const matchesLocation =
        activity.location?.toLowerCase().includes(text) ||
        activity.city?.toLowerCase().includes(text);

      if (!matchesLocation) return false;
    }

    // CATEGORY
    if (
      category &&
      category !== "All" &&
      activity.category !== category
    ) {
      return false;
    }

    // DATE
    if (date) {
      const activityDate = new Date(activity.date)
        .toISOString()
        .split("T")[0];

      if (activityDate !== date) return false;
    }

    return true;
  });

  const getHeading = () => {
    if (activeTab === "my") return "My Activities";
    if (activeTab === "joined") return "Joined Activities";

    return "Upcoming Activities";
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading activities...
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-5">
      <h2 className="text-2xl font-bold mb-3">
        {getHeading()}
      </h2>

      <div className="space-y-6">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
            />
          ))
        ) : (
          <div className="bg-gray-50 rounded-xl py-12 text-center">
            <p className="text-gray-500">
              {activeTab === "my"
                ? "You haven't created any activities yet."
                : activeTab === "joined"
                  ? "You haven't joined any activities yet."
                  : "No activities found."}
            </p>
          </div>
        )}
      </div>

      {/* LOAD MORE */}
      {page < totalPages && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="border border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition px-10 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loadingMore
              ? "Loading..."
              : "Load More Activities"}
          </button>
        </div>
      )}
    </section>
  );
}

export default ActivityList;