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
    RESEND_ACTIVATION: '/api/auth/resend-activation',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    // SSO
    GOOGLE_LOGIN: '/api/auth/oauth2/google',
    GOOGLE_CALLBACK: '/api/auth/oauth2/callback/google',
  },

  // Country endpoints
  COUNTRIES: '/api/countries',

  // Applicant endpoints - matches backend ApplicantController
  APPLICANT: {
    // GET /api/applicants/user/{userId} - Get profile by user ID
    PROFILE_BY_USER: (userId) => `/api/applicants/user/${userId}`,
    // GET /api/applicants/{id} - Get profile by applicant ID
    PROFILE: (id) => `/api/applicants/${id}`,
    // PUT /api/applicants/{id} - Update profile
    UPDATE: (id) => `/api/applicants/${id}`,
    // DELETE /api/applicants/{id} - Delete profile
    DELETE: (id) => `/api/applicants/${id}`,
  },

  // Current User Profile endpoints (/api/applicants/me)
  ME: {
    // GET /api/applicants/me - Get authenticated user's profile
    PROFILE: '/api/applicants/me',
    // PUT /api/applicants/me - Update authenticated user's profile
    UPDATE: '/api/applicants/me',
    // POST /api/applicants/me/avatar - Upload avatar
    AVATAR: '/api/applicants/me/avatar',
    // Work Experience CRUD
    WORK_EXPERIENCE: '/api/applicants/me/work-experience',
    WORK_EXPERIENCE_BY_ID: (id) => `/api/applicants/me/work-experience/${id}`,
    // Education CRUD
    EDUCATION: '/api/applicants/me/education',
    EDUCATION_BY_ID: (id) => `/api/applicants/me/education/${id}`,
    // Skills CRUD
    SKILLS: '/api/applicants/me/skills',
    SKILLS_BATCH: '/api/applicants/me/skills/batch',
    SKILL_BY_NAME: (skill) => `/api/applicants/me/skills/${encodeURIComponent(skill)}`,
    // Portfolio CRUD (Requirement 3.2.3)
    PORTFOLIO: '/api/applicants/me/portfolio',
    PORTFOLIO_IMAGES: '/api/applicants/me/portfolio/images',
    PORTFOLIO_IMAGE_BY_ID: (id) => `/api/applicants/me/portfolio/images/${id}`,
    PORTFOLIO_VIDEOS: '/api/applicants/me/portfolio/videos',
    PORTFOLIO_VIDEO_BY_ID: (id) => `/api/applicants/me/portfolio/videos/${id}`,
  },

  // Job endpoints
  JOBS: {
    SEARCH: '/api/jobs/search',
    DETAILS: '/api/jobs',
    APPLY: '/api/jobs/apply',
  },

  // Application endpoints (Requirement 3.2.4 - Display applications)
  APPLICATIONS: {
    // GET /api/applications/me - Get current user's applications with pagination
    MY: '/api/applications/me',
    // GET /api/applications/history - Get application history
    HISTORY: '/api/applications/history',
    // POST /api/applications - Create new application (multipart/form-data)
    CREATE: '/api/applications',
    // GET /api/applications/{id} - Get application by ID
    BY_ID: (id) => `/api/applications/${id}`,
    // PUT /api/applications/{id}/withdraw - Withdraw application
    WITHDRAW: (id) => `/api/applications/${id}/withdraw`,
    // DELETE /api/applications/{id} - Delete application
    DELETE: (id) => `/api/applications/${id}`,
    // GET /api/applications/job-post/{jobPostId} - Get applications by job post
    BY_JOB_POST: (jobPostId) => `/api/applications/job-post/${jobPostId}`,
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

