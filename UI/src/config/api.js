/**
 * Centralized API & Socket Configuration
 * Reads from environment variables in production (Vercel/Render/Netlify)
 * and falls back to localhost:3000 in development.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

export const AUTH_API_URL = `${API_BASE_URL}/api/auth`;
export const USER_API_URL = `${API_BASE_URL}/api/users`;
export const ACTIVITY_API_URL = `${API_BASE_URL}/api/activity`;
export const BUSINESS_API_URL = `${API_BASE_URL}/api/business`;
export const NOTIFICATION_API_URL = `${API_BASE_URL}/api/notifications`;
export const CHAT_API_URL = `${API_BASE_URL}/api/chat`;
