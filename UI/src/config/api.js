/**
 * Centralized API & Socket Configuration
 * Reads from environment variables in production (Vercel/Render/Netlify)
 * and falls back to deployed production URL or localhost:3000 in development.
 */

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://near-link-main-zuvo.vercel.app"
    : "http://localhost:3000");

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;
export const SOCKET_URL = rawSocketUrl.replace(/\/+$/, "");

export const AUTH_API_URL = `${API_BASE_URL}/api/auth`;
export const USER_API_URL = `${API_BASE_URL}/api/users`;
export const ACTIVITY_API_URL = `${API_BASE_URL}/api/activity`;
export const BUSINESS_API_URL = `${API_BASE_URL}/api/business`;
export const NOTIFICATION_API_URL = `${API_BASE_URL}/api/notifications`;
export const CHAT_API_URL = `${API_BASE_URL}/api/chat`;

/**
 * Format any media or avatar path to point to the correct backend host
 */
export const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (path.startsWith("http://localhost:3000") && API_BASE_URL !== "http://localhost:3000") {
      return path.replace("http://localhost:3000", API_BASE_URL);
    }
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
