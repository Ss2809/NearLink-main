function FeatureCard({ icon, title, description, bg }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-4 text-center">

      {/* Icon */}
      <div
        className={`w-11 h-11 mx-auto rounded-full ${bg} flex items-center justify-center`}
      >
        {icon}
      </div>

      {/* Title */}
      <h2 className="mt-3 text-[17px] font-semibold text-gray-800">
        {title}
      </h2>

      {/* Description */}
      <p className="mt-2 text-[14px] text-gray-500 leading-5">
        {description}
      </p>

    </div>
  );
}

export default FeatureCard;