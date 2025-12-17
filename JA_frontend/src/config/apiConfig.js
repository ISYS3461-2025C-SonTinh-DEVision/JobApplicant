/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Base API URL - Backend server
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    CHECK_SESSION: '/api/auth/check-session',
    ACTIVATE: '/api/auth/activate',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    // SSO
    GOOGLE_LOGIN: '/api/auth/oauth2/google',
    GOOGLE_CALLBACK: '/api/auth/oauth2/callback/google',
  },

  // Country endpoints
  COUNTRIES: '/api/countries',

  // Applicant endpoints
  APPLICANT: {
    PROFILE: '/api/applicants/profile',
    UPDATE: '/api/applicants/update',
    AVATAR: '/api/applicants/avatar',
  },

  // Job endpoints
  JOBS: {
    SEARCH: '/api/jobs/search',
    DETAILS: '/api/jobs',
    APPLY: '/api/jobs/apply',
  },

  // Application endpoints
  APPLICATIONS: {
    LIST: '/api/applications',
    DETAILS: '/api/applications',
  },

  // Subscription endpoints
  SUBSCRIPTION: {
    STATUS: '/api/subscription/status',
    SUBSCRIBE: '/api/subscription/subscribe',
    CANCEL: '/api/subscription/cancel',
  },

  // Search Profile endpoints
  SEARCH_PROFILE: {
    GET: '/api/search-profile',
    CREATE: '/api/search-profile',
    UPDATE: '/api/search-profile',
    DELETE: '/api/search-profile',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/read',
    WEBSOCKET: '/ws/notifications',
  },

  // File upload endpoints
  FILES: {
    UPLOAD: '/api/files/upload',
    DOWNLOAD: '/api/files/download',
  },
};

// HTTP Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Request timeout (ms)
export const REQUEST_TIMEOUT = 30000;

// Auth token configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_TYPE: 'Bearer',
};

const apiConfig = {
  API_BASE_URL,
  API_ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  AUTH_CONFIG,
};

export default apiConfig;

