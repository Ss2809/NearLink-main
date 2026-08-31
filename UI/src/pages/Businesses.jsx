import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BusinessHero from "../components/BusinessHero";
import BusinessList from "../components/BusinessList";
import Footer from "../components/Footer";
import BusinessModal from "../components/business/BusinessModal";

function Businesses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("All");
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRegisterBusinessClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setShowBusinessModal(true);
  };

  return (
    <>
      <Navbar />
      <BusinessHero
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        category={category}
        setCategory={setCategory}
        onRegisterBusiness={handleRegisterBusinessClick}
      />

      <BusinessList
        key={refreshKey}
        search={search}
        sort={sort}
        category={category}
      />

      {showBusinessModal && (
        <BusinessModal
          onClose={() => setShowBusinessModal(false)}
          onSuccess={() => {
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}

      <Footer />
    </>
  );
}

export default Businesses;
