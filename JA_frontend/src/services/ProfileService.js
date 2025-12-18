/**
 * Profile Service
 * Handles all applicant profile-related API calls
 * Connects to backend ApplicantController endpoints
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

class ProfileService {
  /**
   * Get profile by user ID
   * @param {string} userId - User ID (from authentication)
   * @returns {Promise<Object>} Profile data
   */
  async getProfileByUserId(userId) {
    const endpoint = API_ENDPOINTS.APPLICANT.PROFILE_BY_USER(userId);
    const response = await httpUtil.get(endpoint);
    return response;
  }

  /**
   * Get profile by applicant ID
   * @param {string} id - Applicant ID
   * @returns {Promise<Object>} Profile data
   */
  async getProfile(id) {
    const endpoint = API_ENDPOINTS.APPLICANT.PROFILE(id);
    const response = await httpUtil.get(endpoint);
    return response;
  }

  /**
   * Update applicant profile
   * @param {string} id - Applicant ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(id, profileData) {
    const endpoint = API_ENDPOINTS.APPLICANT.UPDATE(id);
    const response = await httpUtil.put(endpoint, profileData);
    return response;
  }

  /**
   * Delete applicant profile
   * @param {string} id - Applicant ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProfile(id) {
    const endpoint = API_ENDPOINTS.APPLICANT.DELETE(id);
    const response = await httpUtil.delete(endpoint);
    return response;
  }

  /**
   * Update avatar
   * @param {string} id - Applicant ID
   * @param {File} avatarFile - Image file
   * @returns {Promise<Object>} Updated profile with new avatar URL
   */
  async updateAvatar(id, avatarFile) {
    // Note: Avatar upload endpoint may need to be implemented in backend
    // This is a placeholder based on common patterns
    const endpoint = `/api/applicants/${id}/avatar`;
    const response = await httpUtil.upload(endpoint, avatarFile);
    return response;
  }
}

// Export singleton instance
const profileService = new ProfileService();
export default profileService;

