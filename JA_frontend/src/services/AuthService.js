/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

class AuthService {
  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.country - Country enum value (VIETNAM, SINGAPORE)
   * @param {string} [userData.firstName] - Optional first name
   * @param {string} [userData.lastName] - Optional last name
   * @param {string} [userData.phoneNumber] - Optional phone number with country code
   * @param {string} [userData.address] - Optional street address
   * @param {string} [userData.city] - Optional city
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    const response = await httpUtil.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response;
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response with access token
   */
  async login(credentials) {
    const response = await httpUtil.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store access token if returned
    if (response?.accessToken) {
      httpUtil.setAuthToken(response.accessToken);
    }
    
    return response;
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const response = await httpUtil.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response;
    } finally {
      // Always clear local tokens
      httpUtil.clearTokens();
    }
  }

  /**
   * Refresh access token using refresh token from cookie
   * @returns {Promise<Object>} New access token
   */
  async refreshToken() {
    const response = await httpUtil.post(API_ENDPOINTS.AUTH.REFRESH);
    
    if (response?.accessToken) {
      httpUtil.setAuthToken(response.accessToken);
    }
    
    return response;
  }

  /**
   * Check current session validity
   * @returns {Promise<Object>} Session info with user details
   */
  async checkSession() {
    const response = await httpUtil.get(API_ENDPOINTS.AUTH.CHECK_SESSION);
    
    // Update token if new one is provided
    if (response?.accessToken) {
      httpUtil.setAuthToken(response.accessToken);
    }
    
    return response;
  }

  /**
   * Activate account using token from email
   * @param {string} token - Activation token
   * @returns {Promise<Object>} Activation result
   */
  async activateAccount(token) {
    const response = await httpUtil.get(API_ENDPOINTS.AUTH.ACTIVATE, { token });
    return response;
  }

  /**
   * Request password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} Request result
   */
  async forgotPassword(email) {
    const response = await httpUtil.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response;
  }

  /**
   * Reset password using token from email
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(token, newPassword) {
    const response = await httpUtil.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
    return response;
  }

  /**
   * Get available countries for registration dropdown
   * @returns {Promise<Array>} List of countries
   */
  async getCountries() {
    const response = await httpUtil.get(API_ENDPOINTS.COUNTRIES);
    return response;
  }

  /**
   * Initiate Google SSO login
   * Redirects user to Google OAuth consent screen
   */
  initiateGoogleLogin() {
    // Google OAuth configuration
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const scope = 'email profile';
    const responseType = 'code';
    
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', clientId);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('scope', scope);
    googleAuthUrl.searchParams.append('response_type', responseType);
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('prompt', 'consent');
    
    window.location.href = googleAuthUrl.toString();
  }

  /**
   * Handle Google OAuth callback
   * @param {string} code - Authorization code from Google
   * @returns {Promise<Object>} Login response
   */
  async handleGoogleCallback(code) {
    const response = await httpUtil.post(API_ENDPOINTS.AUTH.GOOGLE_CALLBACK, { code });
    
    if (response?.accessToken) {
      httpUtil.setAuthToken(response.accessToken);
    }
    
    return response;
  }

  /**
   * Check if user is currently authenticated (has valid token)
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!httpUtil.getAuthToken();
  }

  /**
   * Get current auth token
   * @returns {string|null} Current token
   */
  getToken() {
    return httpUtil.getAuthToken();
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;

