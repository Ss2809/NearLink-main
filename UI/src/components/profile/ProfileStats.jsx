import {
  Bookmark,
  CalendarDays,
  Store,
  Star,
} from "lucide-react";

function ProfileStats() {
  const stats = [
    {
      id: 1,
      title: "Saved Places",
      value: 12,
      icon: Bookmark,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      title: "Joined Activities",
      value: 5,
      icon: CalendarDays,
      color: "bg-green-100 text-green-600",
    },
    {
      id: 3,
      title: "My Businesses",
      value: 2,
      icon: Store,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: 4,
      title: "Reviews",
      value: 18,
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.color}`}
            >
              <Icon size={28} />
            </div>

            <h2 className="text-3xl font-bold mt-5 text-slate-800">
              {item.value}
            </h2>

            <p className="text-gray-500 mt-2">
              {item.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default ProfileStats;