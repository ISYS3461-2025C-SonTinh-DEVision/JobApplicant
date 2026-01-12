/**
 * Search Profile Service
 * 
 * Handles job search profile management for premium subscribers.
 * Implements Requirements 5.2.x for search profile features.
 * 
 * Features:
 * - Save/update search criteria (technical background, employment status, location, salary, titles)
 * - Get saved search profile
 * - Delete search profile
 * 
 * Architecture: A.2.c - REST HTTP Helper Class pattern
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

// Mock search profile
const MOCK_SEARCH_PROFILE = {
    id: 'sp_001',
    technicalSkills: ['React', 'Spring Boot', 'Docker'],
    employmentTypes: ['FULLTIME', 'INTERNSHIP'],
    country: 'Vietnam',
    minSalary: 800,
    maxSalary: null, // No upper limit
    jobTitles: 'Software Engineer; Frontend Developer; Full Stack Developer',
    isActive: true,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
};

class SearchProfileService {
    constructor() {
        this.useMock = false; // Use real API (set to true only for testing without backend)
        this._mockProfile = null;
    }

    /**
     * Get current user's search profile
     * @returns {Promise<Object>} Search profile or null
     */
    async getSearchProfile() {
        if (this.useMock) {
            await this._delay(300);
            return {
                success: true,
                data: this._mockProfile,
            };
        }

        try {
            // httpUtil.get returns data directly, wrap in { data: ... } for consistency
            const data = await httpUtil.get(API_ENDPOINTS.SEARCH_PROFILE.GET);
            // Handle null/undefined/empty responses (204 No Content or empty body)
            if (data === null || data === undefined || data === '') {
                return { success: true, data: null };
            }
            return { success: true, data: data };
        } catch (error) {
            // 204 No Content or 404 Not Found both mean no profile exists
            if (error.status === 404 || error.status === 204) {
                return { success: true, data: null };
            }
            console.error('Error getting search profile:', error);
            throw error;
        }
    }

    /**
     * Create or update search profile
     * @param {Object} profile - Search profile data
     * @param {string[]} profile.technicalSkills - Technical skill tags
     * @param {string[]} profile.employmentTypes - Employment types (FULLTIME, PARTTIME, INTERNSHIP, CONTRACT)
     * @param {string} profile.country - Country preference
     * @param {number} profile.minSalary - Minimum desired salary
     * @param {number} profile.maxSalary - Maximum desired salary (optional)
     * @param {string} profile.jobTitles - Semicolon-separated job titles
     * @returns {Promise<Object>} Saved profile
     */
    async saveSearchProfile(profile) {
        // Validate profile
        const validation = this.validateProfile(profile);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        if (this.useMock) {
            await this._delay(500);

            const savedProfile = {
                id: this._mockProfile?.id || `sp_${Date.now()}`,
                ...profile,
                isActive: true,
                createdAt: this._mockProfile?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            this._mockProfile = savedProfile;

            return {
                success: true,
                message: 'Search profile saved successfully',
                data: savedProfile,
            };
        }

        try {
            if (this._mockProfile) {
                return await httpUtil.put(API_ENDPOINTS.SEARCH_PROFILE.UPDATE, profile);
            } else {
                return await httpUtil.post(API_ENDPOINTS.SEARCH_PROFILE.CREATE, profile);
            }
        } catch (error) {
            console.error('Error saving search profile:', error);
            throw error;
        }
    }

    /**
     * Delete search profile
     * @returns {Promise<Object>} Deletion result
     */
    async deleteSearchProfile() {
        if (this.useMock) {
            await this._delay(300);
            this._mockProfile = null;
            return {
                success: true,
                message: 'Search profile deleted',
            };
        }

        try {
            return await httpUtil.delete(API_ENDPOINTS.SEARCH_PROFILE.DELETE);
        } catch (error) {
            console.error('Error deleting search profile:', error);
            throw error;
        }
    }

    /**
     * Validate search profile data
     * @param {Object} profile - Profile to validate
     * @returns {Object} Validation result
     */
    validateProfile(profile) {
        const errors = [];

        // Technical skills validation (Req 5.2.2)
        // Accept both 'technicalSkills' (form) and 'desiredSkills' (DTO) field names
        const skills = profile.technicalSkills || profile.desiredSkills || [];
        if (skills.length === 0) {
            errors.push('At least one technical skill is required');
        }

        // Employment types validation (Req 5.2.3) - must match Backend enum
        const validTypes = ['FULL_TIME', 'PART_TIME', 'FRESHER', 'INTERNSHIP', 'CONTRACT'];
        if (profile.employmentTypes?.length > 0) {
            const invalidTypes = profile.employmentTypes.filter(t => !validTypes.includes(t));
            if (invalidTypes.length > 0) {
                errors.push(`Invalid employment types: ${invalidTypes.join(', ')}`);
            }
        }

        // Salary validation (Req 5.2.4)
        if (profile.minSalary !== undefined && profile.minSalary !== null) {
            if (typeof profile.minSalary !== 'number' || profile.minSalary < 0) {
                errors.push('Minimum salary must be a positive number');
            }
        }

        if (profile.maxSalary !== undefined && profile.maxSalary !== null) {
            if (typeof profile.maxSalary !== 'number' || profile.maxSalary < 0) {
                errors.push('Maximum salary must be a positive number');
            }
            if (profile.minSalary && profile.maxSalary < profile.minSalary) {
                errors.push('Maximum salary cannot be less than minimum salary');
            }
        }

        // Job titles validation (Req 5.2.1)
        // Handle both array and semicolon-separated string formats
        if (profile.jobTitles) {
            let titles = [];
            if (Array.isArray(profile.jobTitles)) {
                titles = profile.jobTitles;
            } else if (typeof profile.jobTitles === 'string') {
                titles = profile.jobTitles.split(';').filter(t => t.trim());
            }
            if (titles.length > 10) {
                errors.push('Maximum 10 job titles allowed');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Parse job titles string to array
     * @param {string} titlesString - Semicolon-separated job titles
     * @returns {string[]} Array of job titles
     */
    parseJobTitles(titlesString) {
        if (!titlesString) return [];
        return titlesString
            .split(';')
            .map(t => t.trim())
            .filter(t => t.length > 0);
    }

    /**
     * Format job titles array to string
     * @param {string[]} titles - Array of job titles
     * @returns {string} Semicolon-separated string
     */
    formatJobTitles(titles) {
        if (!titles || titles.length === 0) return '';
        return titles.join('; ');
    }

    /**
     * Get default profile template
     * @returns {Object} Default profile structure
     */
    getDefaultProfile() {
        return {
            technicalSkills: [],
            employmentTypes: [],
            country: 'Vietnam',
            minSalary: null,
            maxSalary: null,
            jobTitles: '',
        };
    }

    /**
     * Get matched jobs for current user
     * Per Ultimo 5.3.1: Real-time notification when jobs match search profile
     * @returns {Promise<Object>} List of matched job posts
     */
    async getMatchedJobs() {
        if (this.useMock) {
            await this._delay(300);
            return { success: true, data: [] };
        }

        try {
            const data = await httpUtil.get(API_ENDPOINTS.SEARCH_PROFILE.MATCHED_JOBS);
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Error getting matched jobs:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    /**
     * Simulate a job match for testing
     * Creates a test job that matches user's search profile
     * @returns {Promise<Object>} Simulated matched job
     */
    async simulateJobMatch() {
        if (this.useMock) {
            await this._delay(500);
            return {
                success: true,
                data: {
                    id: 'sim_' + Date.now(),
                    jobTitle: 'Test Software Engineer',
                    matchScore: 85,
                    location: 'Vietnam',
                },
            };
        }

        try {
            const data = await httpUtil.post(API_ENDPOINTS.SEARCH_PROFILE.SIMULATE_MATCH);
            return { success: true, data: data };
        } catch (error) {
            console.error('Error simulating job match:', error);
            throw error;
        }
    }

    /**
     * Check for job matches manually
     * For non-premium users who don't receive real-time notifications
     * @returns {Promise<Object>} List of matched job posts
     */
    async checkMatches() {
        if (this.useMock) {
            await this._delay(300);
            return { success: true, data: [] };
        }

        try {
            const data = await httpUtil.post(API_ENDPOINTS.SEARCH_PROFILE.CHECK_MATCHES);
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Error checking job matches:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    /**
     * Set mock profile (for testing)
     */
    setMockProfile(profile = MOCK_SEARCH_PROFILE) {
        this._mockProfile = { ...profile };
    }

    /**
     * Helper to simulate network delay
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
const searchProfileService = new SearchProfileService();
export default searchProfileService;

// Export class for testing
export { SearchProfileService, MOCK_SEARCH_PROFILE };
