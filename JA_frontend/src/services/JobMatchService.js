/**
 * Job Match Service
 * 
 * Service for fetching and managing matched job posts.
 * 
 * Architecture: A.2.b - Componentized Frontend (Services Layer)
 */

import httpClient from '../utils/httpUtil';
import { API_BASE_URL } from '../config/apiConfig';

/**
 * Job Match Service methods
 */
const JobMatchService = {
    /**
     * Get all matched jobs for current user
     * @returns {Promise<Array>} List of matched job posts
     */
    async getMyMatchedJobs() {
        try {
            const response = await httpClient.get(
                `${API_BASE_URL}/api/search-profiles/me/matched-jobs`
            );
            return response.data || [];
        } catch (error) {
            console.error('[JobMatchService] Error fetching matched jobs:', error);
            throw error;
        }
    },

    /**
     * Check for new job matches (triggers on-demand matching)
     * Only matches jobs posted AFTER search profile was created
     * @returns {Promise<Array>} List of NEW matched job posts
     */
    async checkNewMatches() {
        try {
            const response = await httpClient.post(
                `${API_BASE_URL}/api/search-profiles/me/check-matches`
            );
            return response.data || [];
        } catch (error) {
            console.error('[JobMatchService] Error checking new matches:', error);
            throw error;
        }
    },

    /**
     * Mark a matched job as viewed
     * @param {string} matchId - The matched job post ID
     * @returns {Promise<Object>} Updated matched job post
     */
    async markAsViewed(matchId) {
        try {
            const response = await httpClient.put(
                `${API_BASE_URL}/api/search-profiles/matched-jobs/${matchId}/view`
            );
            return response.data;
        } catch (error) {
            console.error('[JobMatchService] Error marking as viewed:', error);
            throw error;
        }
    },

    /**
     * Get a specific matched job by ID
     * @param {string} matchId - The matched job post ID
     * @returns {Promise<Object>} Matched job post details
     */
    async getMatchedJobById(matchId) {
        try {
            const response = await httpClient.get(
                `${API_BASE_URL}/api/search-profiles/matched-jobs/${matchId}`
            );
            return response.data;
        } catch (error) {
            console.error('[JobMatchService] Error fetching matched job:', error);
            throw error;
        }
    },

    /**
     * Clear all matched jobs for current user (for testing)
     * @returns {Promise<void>}
     */
    async clearMatchedJobs() {
        try {
            await httpClient.delete(
                `${API_BASE_URL}/api/search-profiles/me/matched-jobs`
            );
        } catch (error) {
            console.error('[JobMatchService] Error clearing matched jobs:', error);
            throw error;
        }
    },
};

export default JobMatchService;
