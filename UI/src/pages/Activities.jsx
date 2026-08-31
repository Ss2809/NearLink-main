import { useState } from "react";

import ActivityHero from "../components/Activity/ActivityHero";
import ActivityFilter from "../components/Activity/ActivityFilter";
import ActivityList from "../components/Activity/ActivityList";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import CreateActivityModal from "../components/Activity/CreateActivityModal";

function Activities() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshActivities, setRefreshActivities] = useState(0);
  
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [date, setDate] = useState("");

  const handleActivityCreated = () => {
    setRefreshActivities((prev) => prev + 1);
    setShowCreateModal(false);
  };

  return (
    <>
      <Navbar />

      <ActivityHero />

      <ActivityFilter
        search={search}
        setSearch={setSearch}
        location={location}
        setLocation={setLocation}
        category={category}
        setCategory={setCategory}
        date={date}
        setDate={setDate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCreateActivity={() => setShowCreateModal(true)}
      />

      <ActivityList
        refreshActivities={refreshActivities}
        activeTab={activeTab}
        search={search}
        location={location}
        category={category}
        date={date}
      />

      {showCreateModal && (
        <CreateActivityModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleActivityCreated}
        />
      )}

      <Footer />
    </>
  );
}

export default Activities;