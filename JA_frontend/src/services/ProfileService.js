/**
 * Profile Service
 * Handles all applicant profile-related API calls
 * 
 * Architecture:
 * - A.2.c: REST HTTP Helper Class (httpUtil) provides base functions
 * - Uses /api/applicants/me endpoints for authenticated user
 * - Falls back to /api/applicants/{id} for admin operations
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';
import { enumToIsoCode } from '../data/countries';

class ProfileService {
  // ==================== Current User Profile (ME) ====================

  /**
   * Get authenticated user's profile
   * Uses GET /api/applicants/me
   * @returns {Promise<Object>} Profile data
   */
  async getMyProfile() {
    const response = await httpUtil.get(API_ENDPOINTS.ME.PROFILE);
    return this.normalizeProfile(response);
  }

  /**
   * Update authenticated user's profile
   * Uses PUT /api/applicants/me
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateMyProfile(profileData) {
    // Convert country code to backend format if needed
    const data = { ...profileData };
    if (typeof data.country === 'string' && data.country.length === 2) {
      // Keep as ISO code - JacksonConfig will convert to enum
    }
    const response = await httpUtil.put(API_ENDPOINTS.ME.UPDATE, data);
    return this.normalizeProfile(response);
  }

  /**
   * Upload avatar for authenticated user
   * Uses POST /api/applicants/me/avatar
   * @param {File} avatarFile - Image file
   * @returns {Promise<Object>} Updated profile with avatar URL
   */
  async uploadMyAvatar(avatarFile) {
    const response = await httpUtil.upload(API_ENDPOINTS.ME.AVATAR, avatarFile);
    return response;
  }

  // ==================== Work Experience CRUD ====================

  /**
   * Add work experience
   * @param {Object} data - { company, position, description, startDate, endDate, current }
   */
  async addWorkExperience(data) {
    return httpUtil.post(API_ENDPOINTS.ME.WORK_EXPERIENCE, data);
  }

  /**
   * Update work experience
   * @param {string} id - Work experience ID
   * @param {Object} data - Updated data
   */
  async updateWorkExperience(id, data) {
    return httpUtil.put(API_ENDPOINTS.ME.WORK_EXPERIENCE_BY_ID(id), data);
  }

  /**
   * Delete work experience
   * @param {string} id - Work experience ID
   */
  async deleteWorkExperience(id) {
    return httpUtil.delete(API_ENDPOINTS.ME.WORK_EXPERIENCE_BY_ID(id));
  }

  // ==================== Education CRUD ====================

  /**
   * Add education
   * @param {Object} data - { institution, degree, fieldOfStudy, startDate, endDate, current, description }
   */
  async addEducation(data) {
    return httpUtil.post(API_ENDPOINTS.ME.EDUCATION, data);
  }

  /**
   * Update education
   * @param {string} id - Education ID
   * @param {Object} data - Updated data
   */
  async updateEducation(id, data) {
    return httpUtil.put(API_ENDPOINTS.ME.EDUCATION_BY_ID(id), data);
  }

  /**
   * Delete education
   * @param {string} id - Education ID
   */
  async deleteEducation(id) {
    return httpUtil.delete(API_ENDPOINTS.ME.EDUCATION_BY_ID(id));
  }

  // ==================== Skills CRUD ====================

  /**
   * Add a single skill
   * @param {string} skill - Skill name
   */
  async addSkill(skill) {
    return httpUtil.post(API_ENDPOINTS.ME.SKILLS, { skill });
  }

  /**
   * Add multiple skills
   * @param {string[]} skills - Array of skill names
   */
  async addSkillsBatch(skills) {
    return httpUtil.post(API_ENDPOINTS.ME.SKILLS_BATCH, { skills });
  }

  /**
   * Delete a skill
   * @param {string} skill - Skill name to delete
   */
  async deleteSkill(skill) {
    return httpUtil.delete(API_ENDPOINTS.ME.SKILL_BY_NAME(skill));
  }

  // ==================== Legacy Endpoints (for admin/other use) ====================

  /**
   * Get profile by user ID (legacy)
   * @deprecated Use getMyProfile() instead
   */
  async getProfileByUserId(userId) {
    const endpoint = API_ENDPOINTS.APPLICANT.PROFILE_BY_USER(userId);
    const response = await httpUtil.get(endpoint);
    return this.normalizeProfile(response);
  }

  /**
   * Get profile by applicant ID (legacy)
   */
  async getProfile(id) {
    const endpoint = API_ENDPOINTS.APPLICANT.PROFILE(id);
    const response = await httpUtil.get(endpoint);
    return this.normalizeProfile(response);
  }

  /**
   * Update applicant profile (legacy)
   * @deprecated Use updateMyProfile() instead
   */
  async updateProfile(id, profileData) {
    const endpoint = API_ENDPOINTS.APPLICANT.UPDATE(id);
    const response = await httpUtil.put(endpoint, profileData);
    return this.normalizeProfile(response);
  }

  /**
   * Delete applicant profile
   */
  async deleteProfile(id) {
    const endpoint = API_ENDPOINTS.APPLICANT.DELETE(id);
    return httpUtil.delete(endpoint);
  }

  // ==================== Helpers ====================

  /**
   * Normalize profile data from backend
   * Handles country object → code conversion and enum name → ISO code
   */
  normalizeProfile(profile) {
    if (!profile) return profile;

    // Handle country field - can be object {code, displayName} or string enum name
    let countryCode = null;
    let countryName = null;

    if (typeof profile.country === 'object' && profile.country !== null) {
      // Backend returned object like { code: "VN", displayName: "Vietnam" }
      countryCode = profile.country.code;
      countryName = profile.country.displayName;
    } else if (typeof profile.country === 'string') {
      // Backend returned enum name like "VIETNAM" - convert to ISO code
      countryCode = enumToIsoCode(profile.country);
      countryName = profile.country.replace(/_/g, ' ');
    }

    console.log('[ProfileService] Normalized country:', profile.country, '→', countryCode);

    return {
      ...profile,
      countryCode,
      countryName,
      // Ensure arrays exist
      skills: profile.skills || [],
      education: profile.education || [],
      workExperience: profile.workExperience || [],
    };
  }
}

// Export singleton instance
const profileService = new ProfileService();
export default profileService;
