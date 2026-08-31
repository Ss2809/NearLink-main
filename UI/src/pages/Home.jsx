import Navbar from "../components/Navbar";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import ActivitySection from "../components/Home/ActivitySection";
import BusinessSection from "../components/Home/BusinessSection";
import MapCTA from "../components/Home/MapCTA";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 space-y-4 pb-12">
        <Hero />
        <Features />
        <ActivitySection />
        <BusinessSection />
        <MapCTA />
      </main>

      <Footer />
    </div>
  );
}

export default Home;