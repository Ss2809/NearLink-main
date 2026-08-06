import Navbar from "../components/Navbar";
import BusinessHero from "../components/BusinessHero";
import BusinessList from "../components/BusinessList";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";

function Businesses() {
  return (
    <>
      <Navbar />
      <BusinessHero />
       <BusinessList />
       <Pagination/>
       <Footer/>
    </>
  );
}

export default Businesses;