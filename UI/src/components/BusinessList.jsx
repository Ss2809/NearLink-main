import { useEffect, useState } from "react";
import axios from "axios";
import BusinessCard from "./BusinessCard";

function BusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/business")
      .then((res) => {
        setBusinesses(res.data.businesses || []);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <section className="max-w-7xl mx-auto px-6 py-5">Loading businesses...</section>;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-5">
      <h2 className="text-3xl font-bold mb-8">Popular Businesses</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {businesses.map((business) => (
          <BusinessCard key={business._id || business.id} business={business} />
        ))}
      </div>
    </section>
  );
}

export default BusinessList;