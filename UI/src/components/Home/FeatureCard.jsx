import { useNavigate } from "react-router-dom";

function FeatureCard({ icon, title, description, bg, path }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-xl p-4
                 text-center hover:shadow-md hover:-translate-y-0.5
                 transition cursor-pointer"
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 mx-auto rounded-full ${bg}
                    flex items-center justify-center`}
      >
        {icon}
      </div>

      {/* Title */}
      <h2 className="mt-2 text-[15px] font-semibold text-gray-800">
        {title}
      </h2>

      {/* Description */}
      <p className="mt-1 text-[12px] text-gray-500 leading-4">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;