import { Plus } from "lucide-react";
import activityHero from "../../assets/activity-hero.png";

function ActivityHero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-3">
      <div className="relative rounded-3xl overflow-hidden shadow-md">
        {/* Hero Image */}
        <img
          src={activityHero}
          alt="Activities Hero"
          className="w-full h-60 object-cover"
        />

        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-between px-10">
          {/* Left Content */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-slate-900">
              Explore & Join
              <br />
              Activities
            </h1>

            <p className="mt-4 text-lg text-gray-700 leading-8">
              Connect with people, join activities and make your community
              better.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ActivityHero;
