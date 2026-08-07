import Navbar from "../components/Navbar";
import BusinessHero from "../components/BusinessHero";
import BusinessList from "../components/BusinessList";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import { useState } from "react";
function Businesses() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  return (
    <>
      <Navbar />
      <BusinessHero
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
      />

      <BusinessList search={search} sort={sort} />
      <Footer />
    </>
  );
}

export default Businesses;
