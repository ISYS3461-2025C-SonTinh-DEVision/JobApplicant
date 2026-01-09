/**
 * Activity Service
 * 
 * Fetches user activities from the backend for the Dashboard's Recent Activity section.
 * 
 * Architecture:
 * - A.2.c: REST HTTP Helper Class (httpUtil) provides base functions
 * - A.3.a: Ultimo Frontend - Service Layer
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

class ActivityService {
    /**
     * Get recent activities for the current user
     * @param {number} limit - Maximum number of activities to fetch (default: 20)
     * @returns {Promise<Array>} Array of activity objects
     */
    async getMyActivities(limit = 20) {
        try {
            const response = await httpUtil.get(`${API_ENDPOINTS.ACTIVITIES.LIST}?limit=${limit}`);
            return response || [];
        } catch (error) {
            console.error('[ActivityService] Error fetching activities:', error);
            return [];
        }
    }

    /**
     * Get activities filtered by category
     * @param {string} category - Category to filter (profile, security, subscription, applications)
     * @param {number} limit - Maximum number of activities to fetch
     * @returns {Promise<Array>} Array of activity objects
     */
    async getActivitiesByCategory(category, limit = 20) {
        try {
            const response = await httpUtil.get(
                `${API_ENDPOINTS.ACTIVITIES.BY_CATEGORY(category)}?limit=${limit}`
            );
            return response || [];
        } catch (error) {
            console.error('[ActivityService] Error fetching activities by category:', error);
            return [];
        }
    }

    /**
     * Format activity for display in dashboard
     * @param {Object} activity - Raw activity from API
     * @returns {Object} Formatted activity for UI
     */
    formatActivityForDisplay(activity) {
        return {
            id: activity.id,
            type: activity.category || 'profile',
            icon: activity.icon || 'Activity',
            title: activity.title,
            description: activity.description,
            time: activity.timeAgo,
            timestamp: activity.createdAt ? new Date(activity.createdAt).getTime() : Date.now(),
            metadata: activity.metadata,
        };
    }

    /**
     * Get formatted activities ready for dashboard display
     * @param {number} limit - Maximum number of activities
     * @returns {Promise<Array>} Formatted activities
     */
    async getFormattedActivities(limit = 20) {
        const activities = await this.getMyActivities(limit);
        return activities.map(activity => this.formatActivityForDisplay(activity));
    }
}

// Export singleton instance
const activityService = new ActivityService();
export { activityService, ActivityService };
export default activityService;
