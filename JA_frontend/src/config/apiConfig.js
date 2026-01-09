/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Base API URL - Backend server
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Job Manager API URL - External backend for job posts and companies
export const JOB_MANAGER_API_URL = process.env.REACT_APP_JOB_MANAGER_API_URL || 'https://jobmanager-backend-production.up.railway.app';

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
    CHANGE_PASSWORD: '/api/auth/change-password',
    CHANGE_EMAIL: '/api/auth/change-email',
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
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
    // GET /api/applicants/me/profile-views - Get profile view statistics
    PROFILE_VIEWS: '/api/applicants/me/profile-views',
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

  // Job endpoints (local backend proxy)
  JOBS: {
    SEARCH: '/api/jobs/search',
    DETAILS: '/api/jobs',
    APPLY: '/api/jobs/apply',
  },

  // Job Manager external API endpoints (proxied through JA backend for security)
  JOB_MANAGER: {
    // Job Posts - proxied through JA backend
    JOB_POSTS: '/api/job-posts',
    JOB_POST_BY_ID: (id) => `/api/job-posts/${id}`,
    // Companies - OLD endpoints (deprecated, use JM_COMPANY instead)
    COMPANIES: '/api/jm/company',
    COMPANY_BY_ID: (id) => `/api/jm/company/${id}`,
    // Auth (for token forwarding)
    AUTH_USERS: '/api/auth/users',
  },

  // JM Company endpoints (proxied through JA backend at /api/jm/company)
  JM_COMPANY: {
    // GET /api/jm/company - Get all companies with pagination and search
    LIST: '/api/jm/company',
    // GET /api/jm/company/{id} - Get company by ID
    BY_ID: (id) => `/api/jm/company/${id}`,
    // POST /api/jm/company/{id}/activate - Activate company account (admin)
    ACTIVATE: (id) => `/api/jm/company/${id}/activate`,
    // POST /api/jm/company/{id}/deactivate - Deactivate company account (admin)
    DEACTIVATE: (id) => `/api/jm/company/${id}/deactivate`,
  },

  // Application endpoints (Requirement 3.2.4 - Display applications)
  APPLICATIONS: {
    // GET /api/applications/my-applications - Get current user's applications with pagination
    MY: '/api/applications/my-applications',
    // GET /api/applications/history - Get application history
    HISTORY: '/api/applications/history',
    // POST /api/applications - Create new application (multipart/form-data)
    CREATE: '/api/applications',
    // GET /api/applications/{id} - Get application by ID
    BY_ID: (id) => `/api/applications/${id}`,
    // PATCH /api/applications/{id}/withdraw - Withdraw application
    WITHDRAW: (id) => `/api/applications/${id}/withdraw`,
    // DELETE /api/applications/{id} - Delete application
    DELETE: (id) => `/api/applications/${id}`,
    // GET /api/applications/job/{jobPostId} - Get applications by job post
    BY_JOB_POST: (jobPostId) => `/api/applications/job/${jobPostId}`,
  },

  // Subscription endpoints
  SUBSCRIPTION: {
    STATUS: '/api/subscription/status',
    SUBSCRIBE: '/api/subscription/subscribe',
    CANCEL: '/api/subscription/cancel',
  },

  // Search Profile endpoints (using /me for JWT-based authentication)
  SEARCH_PROFILE: {
    GET: '/api/search-profiles/me',
    CREATE: '/api/search-profiles/me',
    UPDATE: '/api/search-profiles/me',
    DELETE: '/api/search-profiles/me',
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

