/**
 * Dashboard Service
 * 
 * Aggregates data from multiple endpoints for the dashboard page.
 * Calculates derived metrics like profile completion percentage.
 * 
 * Architecture:
 * - A.2.c: REST HTTP Helper Class (httpUtil) provides base functions
 * - Combines data from ApplicationService, ProfileService, SubscriptionService
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

// Profile completion weights (total = 100%)
const PROFILE_WEIGHTS = {
    avatar: 10,
    objectiveSummary: 15,
    education: 20,       // At least 1 entry
    workExperience: 20,  // At least 1 entry
    skills: 20,          // At least 3 skills
    phoneNumber: 5,
    addressCity: 10,     // Both address and city
};

class DashboardService {
    /**
     * Get all dashboard data in a single call
     * Aggregates applications, profile, and subscription data
     * @returns {Promise<Object>} Dashboard data
     */
    async getDashboardData() {
        try {
            // Fetch all data in parallel
            const [historyResponse, profileResponse, subscriptionResponse, profileViewsResponse, activitiesResponse] = await Promise.allSettled([
                this.getApplicationHistory(),
                this.getProfile(),
                this.getSubscriptionStatus(),
                this.getProfileViewStats(),
                this.getRealActivities(),
            ]);

            // Extract data or use defaults
            const history = historyResponse.status === 'fulfilled' ? historyResponse.value : null;
            const profile = profileResponse.status === 'fulfilled' ? profileResponse.value : null;
            const subscription = subscriptionResponse.status === 'fulfilled' ? subscriptionResponse.value : null;
            const profileViews = profileViewsResponse.status === 'fulfilled' ? profileViewsResponse.value : null;
            const realActivities = activitiesResponse.status === 'fulfilled' ? activitiesResponse.value : null;

            // Calculate stats
            const stats = this.calculateStats(history, profileViews);
            const profileCompletion = this.calculateProfileCompletion(profile);
            const recentApplications = this.extractRecentApplications(history, 5);

            // Use real activities from API, fallback to generated if empty
            let recentActivity = [];
            if (realActivities && realActivities.length > 0) {
                recentActivity = realActivities.map(activity => ({
                    type: activity.category || 'profile',
                    icon: activity.icon || 'Activity',
                    title: activity.title,
                    description: activity.description,
                    time: activity.timeAgo,
                    timestamp: activity.createdAt ? new Date(activity.createdAt).getTime() : Date.now(),
                }));
            } else {
                // Fallback to generated activities if no real activities exist yet
                recentActivity = this.generateActivityFromData(history, profile);
            }

            return {
                success: true,
                data: {
                    stats,
                    profileCompletion,
                    recentApplications,
                    recentActivity,
                    subscription: subscription || { plan: 'FREEMIUM', status: 'inactive' },
                    profile,
                    profileViews, // Include full profile views data
                },
            };
        } catch (error) {
            console.error('[DashboardService] Error fetching dashboard data:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch dashboard data',
            };
        }
    }

    /**
     * Get application history with statistics
     * @returns {Promise<Object>} Application history response
     */
    async getApplicationHistory() {
        try {
            return await httpUtil.get(API_ENDPOINTS.APPLICATIONS.HISTORY);
        } catch (error) {
            console.error('[DashboardService] Error fetching application history:', error);
            throw error;
        }
    }

    /**
     * Get user profile
     * @returns {Promise<Object>} Profile data
     */
    async getProfile() {
        try {
            return await httpUtil.get(API_ENDPOINTS.ME.PROFILE);
        } catch (error) {
            console.error('[DashboardService] Error fetching profile:', error);
            throw error;
        }
    }

    /**
     * Get subscription status
     * @returns {Promise<Object>} Subscription data
     */
    async getSubscriptionStatus() {
        try {
            return await httpUtil.get(API_ENDPOINTS.SUBSCRIPTION.STATUS);
        } catch (error) {
            console.error('[DashboardService] Error fetching subscription:', error);
            throw error;
        }
    }

    /**
     * Get profile view statistics
     * Tracks when employers/JM view the applicant's profile
     * @returns {Promise<Object>} Profile view stats
     */
    async getProfileViewStats() {
        try {
            return await httpUtil.get(API_ENDPOINTS.ME.PROFILE_VIEWS);
        } catch (error) {
            console.error('[DashboardService] Error fetching profile view stats:', error);
            throw error;
        }
    }

    /**
     * Get real activities from the backend API
     * @param {number} limit - Maximum number of activities to fetch
     * @returns {Promise<Array>} Array of activity objects
     */
    async getRealActivities(limit = 20) {
        try {
            const response = await httpUtil.get(`${API_ENDPOINTS.ACTIVITIES.LIST}?limit=${limit}`);
            return response || [];
        } catch (error) {
            console.error('[DashboardService] Error fetching activities:', error);
            return []; // Return empty array on error, will fallback to generated activities
        }
    }

    /**
     * Calculate dashboard statistics from application history
     * @param {Object} history - Application history response
     * @param {Object} profileViews - Profile view statistics (optional)
     * @returns {Object} Calculated stats
     */
    calculateStats(history, profileViews = null) {
        if (!history || !history.statistics) {
            return {
                totalApplications: 0,
                pending: 0,
                accepted: 0,
                rejected: 0,
                withdrawn: 0,
                profileViews: profileViews?.totalViews || 0,
                profileViewsThisWeek: profileViews?.viewsThisWeek || 0,
                profileViewsThisMonth: profileViews?.viewsThisMonth || 0,
                applicationsTrend: 0,
                acceptedTrend: 0,
                profileViewsTrend: profileViews?.trendPercentage || 0,
                profileViewsTrendDirection: profileViews?.trendDirection || 'stable',
            };
        }

        const { statistics } = history;

        return {
            totalApplications: statistics.totalApplications || 0,
            pending: statistics.pendingCount || 0,
            accepted: statistics.acceptedCount || 0,
            rejected: statistics.rejectedCount || 0,
            withdrawn: statistics.withdrawnCount || 0,
            // Real profile views from API
            profileViews: profileViews?.totalViews || 0,
            profileViewsThisWeek: profileViews?.viewsThisWeek || 0,
            profileViewsThisMonth: profileViews?.viewsThisMonth || 0,
            // Trends
            applicationsTrend: 0,
            acceptedTrend: 0,
            profileViewsTrend: profileViews?.trendPercentage || 0,
            profileViewsTrendDirection: profileViews?.trendDirection || 'stable',
        };
    }

    /**
     * Calculate profile completion percentage
     * @param {Object} profile - Profile data
     * @returns {Object} Completion info with percentage and missing fields
     */
    calculateProfileCompletion(profile) {
        if (!profile) {
            return {
                percentage: 0,
                missingFields: Object.keys(PROFILE_WEIGHTS),
                completedFields: [],
            };
        }

        let completedWeight = 0;
        const missingFields = [];
        const completedFields = [];

        // Check avatar
        if (profile.avatarUrl || profile.avatar) {
            completedWeight += PROFILE_WEIGHTS.avatar;
            completedFields.push('avatar');
        } else {
            missingFields.push('avatar');
        }

        // Check objective summary
        if (profile.objectiveSummary && profile.objectiveSummary.trim().length > 10) {
            completedWeight += PROFILE_WEIGHTS.objectiveSummary;
            completedFields.push('objectiveSummary');
        } else {
            missingFields.push('objectiveSummary');
        }

        // Check education (at least 1 entry)
        if (profile.education && profile.education.length > 0) {
            completedWeight += PROFILE_WEIGHTS.education;
            completedFields.push('education');
        } else {
            missingFields.push('education');
        }

        // Check work experience (at least 1 entry)
        if (profile.workExperience && profile.workExperience.length > 0) {
            completedWeight += PROFILE_WEIGHTS.workExperience;
            completedFields.push('workExperience');
        } else {
            missingFields.push('workExperience');
        }

        // Check skills (at least 3)
        if (profile.skills && profile.skills.length >= 3) {
            completedWeight += PROFILE_WEIGHTS.skills;
            completedFields.push('skills');
        } else {
            missingFields.push('skills');
        }

        // Check phone number
        if (profile.phoneNumber && profile.phoneNumber.trim().length > 0) {
            completedWeight += PROFILE_WEIGHTS.phoneNumber;
            completedFields.push('phoneNumber');
        } else {
            missingFields.push('phoneNumber');
        }

        // Check address and city
        const hasAddress = profile.address && profile.address.trim().length > 0;
        const hasCity = profile.city && profile.city.trim().length > 0;
        if (hasAddress && hasCity) {
            completedWeight += PROFILE_WEIGHTS.addressCity;
            completedFields.push('addressCity');
        } else {
            missingFields.push('addressCity');
        }

        return {
            percentage: completedWeight,
            missingFields,
            completedFields,
        };
    }

    /**
     * Extract recent applications for display
     * @param {Object} history - Application history response
     * @param {number} limit - Maximum number of applications to return
     * @returns {Array} Recent applications
     */
    extractRecentApplications(history, limit = 5) {
        if (!history || !history.applications) {
            return [];
        }

        return history.applications.slice(0, limit).map(app => ({
            id: app.id,
            jobTitle: app.jobTitle || 'Unknown Position',
            company: app.companyName || 'Unknown Company',
            appliedDate: this.formatRelativeTime(app.appliedAt || app.createdAt),
            status: app.status || 'PENDING',
            jobPostId: app.jobPostId,
        }));
    }

    /**
     * Generate activity feed from application and profile data
     * @param {Object} history - Application history response
     * @param {Object} profile - Profile data
     * @returns {Array} Activity items
     */
    generateActivityFromData(history, profile) {
        const activities = [];

        // Add application activities
        if (history && history.applications) {
            history.applications.slice(0, 5).forEach(app => {
                activities.push({
                    type: 'applications',
                    icon: 'FileText',
                    title: 'Application submitted',
                    description: `Applied for ${app.jobTitle || 'a position'} at ${app.companyName || 'a company'}`,
                    time: this.formatRelativeTime(app.appliedAt || app.createdAt),
                    timestamp: new Date(app.appliedAt || app.createdAt).getTime(),
                });
            });
        }

        // Add profile activity if recently updated
        if (profile && profile.updatedAt) {
            const updateTime = new Date(profile.updatedAt).getTime();
            const now = Date.now();
            const dayInMs = 24 * 60 * 60 * 1000;

            // Only show profile updates from the last 7 days
            if (now - updateTime < 7 * dayInMs) {
                activities.push({
                    type: 'profile',
                    icon: 'CheckCircle',
                    title: 'Profile updated',
                    description: profile.skills?.length > 0
                        ? `Skills: ${profile.skills.slice(0, 3).join(', ')}${profile.skills.length > 3 ? '...' : ''}`
                        : 'Profile information updated',
                    time: this.formatRelativeTime(profile.updatedAt),
                    timestamp: updateTime,
                });
            }
        }

        // Sort by timestamp (most recent first)
        activities.sort((a, b) => b.timestamp - a.timestamp);

        return activities.slice(0, 10);
    }

    /**
     * Format date to relative time string
     * @param {string} dateStr - ISO date string
     * @returns {string} Relative time (e.g., "2 days ago")
     */
    formatRelativeTime(dateStr) {
        if (!dateStr) return 'Recently';

        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    /**
     * Get missing profile field display names
     * @param {string} field - Field key
     * @returns {string} Display name
     */
    static getFieldDisplayName(field) {
        const names = {
            avatar: 'Profile Picture',
            objectiveSummary: 'Career Objective',
            education: 'Education History',
            workExperience: 'Work Experience',
            skills: 'Skills (at least 3)',
            phoneNumber: 'Phone Number',
            addressCity: 'Address & City',
        };
        return names[field] || field;
    }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;

// Export class for testing
export { DashboardService, PROFILE_WEIGHTS };
