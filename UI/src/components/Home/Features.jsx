import {
  Store,
  Calendar,
  Map,
  MessageCircle,
  Bell,
  User,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

function Features() {

  const features = [

    {
      id: 1,
      icon: <Store size={20} className="text-green-600" />,
      bg: "bg-green-100",
      title: "Nearby Businesses",
      description: "Discover great local businesses near you."
    },

    {
      id: 2,
      icon: <Calendar size={20} className="text-orange-500" />,
      bg: "bg-orange-100",
      title: "Local Activities",
      description: "Find and join exciting community activities."
    },

    {
      id: 3,
      icon: <Map size={20} className="text-blue-500" />,
      bg: "bg-blue-100",
      title: "Interactive Map",
      description: "Explore places and activities on the map."
    },

    {
      id: 4,
      icon: <MessageCircle size={20} className="text-purple-500" />,
      bg: "bg-purple-100",
      title: "Community Chat",
      description: "Connect and chat with local people."
    },

    {
      id: 5,
      icon: <Bell size={20} className="text-yellow-500" />,
      bg: "bg-yellow-100",
      title: "Notifications",
      description: "Stay updated with important alerts."
    },

    {
      id: 6,
      icon: <User size={20} className="text-pink-500" />,
      bg: "bg-pink-100",
      title: "User Profile",
      description: "Manage your profile and preferences."
    }

  ];

  return (

    <section className="max-w-[1500px] mx-auto px-7 py-1">

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

        {features.map((feature) => (

          <FeatureCard

            key={feature.id}

            icon={feature.icon}

            bg={feature.bg}

            title={feature.title}

            description={feature.description}

          />

        ))}

      </div>

    </section>

  );
}

export default Features;