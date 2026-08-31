import { useEffect, useState } from "react";
import axios from "axios";
import BusinessCard from "./BusinessCard";
import Pagination from "./Pagination";
import { BUSINESS_API_URL } from "../config/api";

function BusinessList({ search, sort, category }) {
  const [businesses, setBusinesses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  useEffect(() => {
  axios.get(
  `${BUSINESS_API_URL}?page=${currentPage}&limit=6&search=${encodeURIComponent(search)}&sort=${sort}&category=${encodeURIComponent(category)}&lat=${location?.latitude || ""}&lng=${location?.longitude || ""}`
)
      .then((res) => {
        setBusinesses(res.data.businesses || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
}, [currentPage, search, sort, category, location]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-8">Popular Businesses</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {businesses.map((business) => (
          <BusinessCard key={business._id} business={business} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </section>
  );
}

export default BusinessList;
