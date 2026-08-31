import { useState, useEffect } from "react";

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-24 h-24 text-2xl",
  "2xl": "w-32 h-32 text-3xl",
};

/**
 * Single source of truth Avatar component across NearLink.
 *
 * @param {Object} props
 * @param {string} [props.src] - Image URL from MongoDB user.avatar
 * @param {string} [props.name] - User full name or identifier for seed
 * @param {string} [props.size="md"] - "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
 * @param {string} [props.className] - Additional Tailwind classes
 * @param {string} [props.alt] - Alt text
 * @param {boolean} [props.border=false] - Border style
 */
export default function Avatar({
  src,
  name = "User",
  size = "md",
  className = "",
  alt = "",
  border = false,
}) {
  const [imgError, setImgError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  // Reset error states if src or name changes
  useEffect(() => {
    setImgError(false);
    setFallbackError(false);
  }, [src, name]);

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initial = (name?.[0] || "U").toUpperCase();
  const dicebearUrl = `https://api.dicebear.com/10.x/toon-head/png?seed=${encodeURIComponent(
    name || "user"
  )}`;

  const activeSrc = src && !imgError ? src : !fallbackError ? dicebearUrl : null;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden select-none bg-slate-100 ${sizeClass} ${
        border ? "border-2 border-green-500 shadow-xs" : ""
      } ${className}`}
    >
      {activeSrc ? (
        <img
          src={activeSrc}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => {
            if (!imgError && src) {
              setImgError(true);
            } else {
              setFallbackError(true);
            }
          }}
        />
      ) : (
        <span className="font-bold text-slate-700 uppercase">{initial}</span>
      )}
    </div>
  );
}
