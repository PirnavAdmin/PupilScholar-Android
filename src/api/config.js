/**
 * API Configuration
 * Dynamically resolves backend target URL from the .env file.
 */

let envConfig = {};
try {
  envConfig = require('./env.json');
} catch {
  envConfig = {};
}

let customRuntimeUrl = null;

/**
 * Allows setting a custom dynamic URL at runtime
 */
export const setDynamicApiUrl = (url) => {
  customRuntimeUrl = url;
};

/**
 * Resolve the dynamic backend URL from:
 * 1. Runtime override (if set)
 * 2. .env file variables via env.json (VITE_API_URL, VITE_BACKEND_TARGET, etc.)
 * 3. Process environment variables (EXPO_PUBLIC_API_URL, VITE_API_URL, etc.)
 */
export const getApiBaseUrl = () => {
  if (customRuntimeUrl) return customRuntimeUrl.replace(/\/+$/, '');

  const fromEnvJson =
    envConfig?.VITE_API_URL ||
    envConfig?.VITE_BACKEND_TARGET ||
    envConfig?.API_URL;

  const fromProcessEnv =
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.EXPO_PUBLIC_VITE_API_URL ||
        process.env.EXPO_PUBLIC_VITE_BACKEND_TARGET ||
        process.env.VITE_API_URL ||
        process.env.VITE_BACKEND_TARGET)) ||
    null;

  const resolved = fromEnvJson || fromProcessEnv || '';
  return resolved ? resolved.replace(/\/+$/, '') : '';
};

export const API_BASE_URL = getApiBaseUrl();
export const DEFAULT_API_URL = getApiBaseUrl();

export const REQUEST_TIMEOUT_MS = 12000;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SUPERADMIN_LOGIN: '/api/superadmin/login',
    CHANGE_PASSWORD: '/api/auth/change-password',
    SEND_OTP: '/api/auth/otp/send',
    VERIFY_OTP: '/api/auth/otp/verify',
    RESET_PASSWORD: '/api/auth/otp/reset-password',
  },
  DASHBOARD: {
    SUMMARY: '/api/dashboard/summary',
    TEACHER: '/api/teacher/dashboard',
    PARENT: (studentId) => `/api/parent/dashboard/${studentId}`,
  },
  COMMUNICATIONS: {
    NOTIFICATIONS: '/api/communications/notifications',
    CIRCULARS: '/api/communications/circulars',
    ANNOUNCEMENTS: '/api/communications/announcements',
  },
};
