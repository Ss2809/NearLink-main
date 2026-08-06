import ActivityCard from "./ActivityCard1";
import activityData from "./activityData";

function ActivityList() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-5">

      <h2 className="text-2xl font-bold mb-3">
        Upcoming Activities
      </h2>

      <div className="space-y-6">

        {activityData.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
          />
        ))}

      </div>

      {/* Load More Button */}

      <div className="flex justify-center mt-10">

        <button className="border border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition px-10 py-3 rounded-xl font-semibold">
          Load More Activities
        </button>

      </div>

    </section>
  );
}

export default ActivityList;