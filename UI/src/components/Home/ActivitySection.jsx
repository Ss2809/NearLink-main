import football from "../../assets/activities/football.jpg";
import yoga from "../../assets/activities/yoga.png";
import cleanup from "../../assets/activities/clean.jpg";
import coffee from "../../assets/activities/coffee.jpg";

import ActivityCard from "./ActivityCard";

function ActivitySection() {

  const activities = [

    {
      id:1,
      image:football,
      title:"Weekend Football Match",
      location:"Central Park",
      date:"May 25, 2027 • 10:00 AM"
    },

    {
      id:2,
      image:yoga,
      title:"Yoga in the Park",
      location:"Green Garden",
      date:"May 26, 2027 • 7:00 AM"
    },

    {
      id:3,
      image:cleanup,
      title:"Community Clean-up",
      location:"Riverside Area",
      date:"May 27, 2027 • 9:00 AM"
    },

    {
      id:4,
      image:coffee,
      title:"Coffee Meetup",
      location:"Downtown Café",
      date:"May 28, 2027 • 6:00 PM"
    }

  ];

  return (

    <section className="max-w-375 mx-auto mt-1.5">

  <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-1">

    <div className="flex justify-between items-center">

      <h2 className="text-xl font-bold">
        Latest Activities
      </h2>

      <button className="text-green-600 text-sm font-semibold hover:underline">
        View All →
      </button>

    </div>

    <div className="grid grid-cols-4 gap-6 mt-5">

      {activities.map((activity) => (

        <ActivityCard
          key={activity.id}
          image={activity.image}
          title={activity.title}
          location={activity.location}
          date={activity.date}
        />

      ))}

    </div>

  </div>

</section>

  );
}

export default ActivitySection;