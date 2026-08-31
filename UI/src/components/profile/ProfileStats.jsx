import {
  Store,
  CalendarCheck,
  CalendarPlus,
  Sparkles,
} from "lucide-react";

function ProfileStats({ stats }) {
  const statItems = [
    {
      id: 1,
      title: "My Businesses",
      value: stats?.myBusinessesCount ?? 0,
      icon: Store,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      id: 2,
      title: "Joined Activities",
      value: stats?.joinedActivitiesCount ?? 0,
      icon: CalendarCheck,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 3,
      title: "Organized Activities",
      value: stats?.createdActivitiesCount ?? 0,
      icon: CalendarPlus,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: 4,
      title: "Community Status",
      value: "Active",
      isBadge: true,
      icon: Sparkles,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 md:p-6 hover:shadow-md transition group"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-105 transition shadow-2xs`}
            >
              <Icon size={24} />
            </div>

            <div className="mt-4">
              <h2
                className={`font-extrabold text-slate-900 ${
                  item.isBadge ? "text-xl text-green-600" : "text-3xl"
                }`}
              >
                {item.value}
              </h2>

              <p className="text-xs font-medium text-slate-500 mt-1">
                {item.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProfileStats;