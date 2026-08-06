import ActivityHero from "../components/Activity/ActivityHero";
import ActivityFilter from "../components/Activity/ActivityFilter";
import ActivityList from "../components/Activity/ActivityList";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function Activities() {
  return (
    <>
    <Navbar/>
      <ActivityHero />
      <ActivityFilter />
      <ActivityList />
      <Footer />
    </>
  );
}

export default Activities;