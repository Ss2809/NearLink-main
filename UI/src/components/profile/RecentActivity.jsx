import { Clock, MapPin, Calendar, Star } from "lucide-react";

function RecentActivity() {
  const activities = [
    {
      id: 1,
      title: "Joined Morning Yoga",
      subtitle: "Koregaon Park",
      time: "2 hours ago",
      icon: Calendar,
      color: "bg-green-100 text-green-600",
    },
    {
      id: 2,
      title: "Saved Cafe Aroma",
      subtitle: "Wagholi",
      time: "Yesterday",
      icon: MapPin,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 3,
      title: "Reviewed Fit & Strong Gym",
      subtitle: "⭐⭐⭐⭐⭐",
      time: "2 days ago",
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-4 last:border-none"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
                >
                  <Icon size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock size={15} />
                {item.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentActivity;