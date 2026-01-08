
/**
 * Notification Service
 * 
 * Handles notification management for Job Applicants.
 * Implements Requirement 5.3.1 for real-time notification service via WebSocket/Kafka.
 * 
 * Features:
 * - Get user notifications
 * - Mark notifications as read
 * - Delete notifications
 * - Real-time notification via WebSocket
 * 
 * Architecture: A.2.c - REST HTTP Helper Class pattern
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS, API_BASE_URL } from '../config/apiConfig';

// Notification types
export const NOTIFICATION_TYPES = {
    JOB_MATCH: 'JOB_MATCH',           // New job matches search profile
    APPLICATION_UPDATE: 'APPLICATION_UPDATE', // Application status changed
    PROFILE_VIEW: 'PROFILE_VIEW',     // Company viewed profile
    SYSTEM: 'SYSTEM',                 // System announcements
    SUBSCRIPTION: 'SUBSCRIPTION',     // Subscription updates
};

// Mock notifications for development
const MOCK_NOTIFICATIONS = [
    {
        id: 'notif_001',
        type: NOTIFICATION_TYPES.JOB_MATCH,
        title: 'New Job Match!',
        content: 'A new job "Senior React Developer" at TechCorp matches your profile.',
        jobId: 'job_123',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    },
    {
        id: 'notif_002',
        type: NOTIFICATION_TYPES.APPLICATION_UPDATE,
        title: 'Application Status Updated',
        content: 'Your application for "Frontend Developer" at StartupXYZ is now being reviewed.',
        applicationId: 'app_456',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    },
    {
        id: 'notif_003',
        type: NOTIFICATION_TYPES.PROFILE_VIEW,
        title: 'Profile Viewed',
        content: 'A recruiter from Google viewed your profile.',
        companyId: 'comp_789',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: 'notif_004',
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Welcome to DEVision Premium!',
        content: 'Your premium subscription is now active. Enjoy real-time job alerts!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
];

class NotificationService {
    constructor() {
        this.useMock = true; // Toggle for development
        this._mockNotifications = [...MOCK_NOTIFICATIONS];
        this._listeners = new Set();
    }

    /**
     * Subscribe to notification updates
     * @param {Function} callback - Callback function for new notifications
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    }

    /**
     * Notify all listeners of a new notification
     * @param {Object} notification - New notification
     */
    _notifyListeners(notification) {
        this._listeners.forEach(callback => callback(notification));
    }

    /**
     * Get all notifications for current user
     * @returns {Promise<Object>} Notifications with metadata
     */
    async getNotifications() {
        if (this.useMock) {
            await this._delay(300);
            const unreadCount = this._mockNotifications.filter(n => !n.read).length;
            return {
                success: true,
                data: {
                    notifications: [...this._mockNotifications],
                    total: this._mockNotifications.length,
                    unreadCount,
                },
            };
        }

        try {
            const userId = this._getCurrentUserId();
            const response = await httpUtil.get(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/user/${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    /**
     * Get unread notifications only
     * @returns {Promise<Object>} Unread notifications
     */
    async getUnreadNotifications() {
        if (this.useMock) {
            await this._delay(200);
            const unread = this._mockNotifications.filter(n => !n.read);
            return {
                success: true,
                data: unread,
            };
        }

        try {
            const userId = this._getCurrentUserId();
            return await httpUtil.get(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/user/${userId}/unread`);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            throw error;
        }
    }

    /**
     * Get unread count
     * @returns {Promise<number>} Unread count
     */
    async getUnreadCount() {
        if (this.useMock) {
            await this._delay(100);
            return this._mockNotifications.filter(n => !n.read).length;
        }

        try {
            const userId = this._getCurrentUserId();
            const response = await httpUtil.get(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/user/${userId}/unread-count`);
            return response.unreadCount || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }

    /**
     * Mark a notification as read
     * @param {string} notificationId - Notification ID
     * @returns {Promise<Object>} Updated notification
     */
    async markAsRead(notificationId) {
        if (this.useMock) {
            await this._delay(200);
            const index = this._mockNotifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                this._mockNotifications[index] = {
                    ...this._mockNotifications[index],
                    read: true,
                    readAt: new Date().toISOString(),
                };
                return {
                    success: true,
                    data: this._mockNotifications[index],
                };
            }
            throw new Error('Notification not found');
        }

        try {
            return await httpUtil.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
    /**
     * Mark all notifications as read
     * @returns {Promise<Object>} Result
     */
    async markAllAsRead() {
        if (this.useMock) {
            await this._delay(300);
            this._mockNotifications = this._mockNotifications.map(n => ({
                ...n,
                read: true,
                readAt: new Date().toISOString(),
            }));
            return {
                success: true,
                message: 'All notifications marked as read',
            };
        }

        try {
            const userId = this._getCurrentUserId();
            return await httpUtil.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/user/${userId}/read-all`);
        } catch (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    }

    /**
     * Delete a notification
     * @param {string} notificationId - Notification ID
     * @returns {Promise<Object>} Result
     */
    async deleteNotification(notificationId) {
        if (this.useMock) {
            await this._delay(200);
            const index = this._mockNotifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                this._mockNotifications.splice(index, 1);
                return {
                    success: true,
                    message: 'Notification deleted',
                };
            }
            throw new Error('Notification not found');
        }

        try {
            return await httpUtil.delete(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${notificationId}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
    /**
     * Delete all notifications
     * @returns {Promise<Object>} Result
     */
    async deleteAllNotifications() {
        if (this.useMock) {
            await this._delay(300);
            this._mockNotifications = [];
            return {
                success: true,
                message: 'All notifications deleted',
            };
        }

        try {
            const userId = this._getCurrentUserId();
            return await httpUtil.delete(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/user/${userId}`);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
            throw error;
        }
    }

    /**
     * Add a new notification (for testing/mock)
     * @param {Object} notification - Notification data
     */
    addMockNotification(notification) {
        const newNotification = {
            id: `notif_${Date.now()}`,
            read: false,
            createdAt: new Date().toISOString(),
            ...notification,
        };
        this._mockNotifications.unshift(newNotification);
        this._notifyListeners(newNotification);
        return newNotification;
    }

    /**
     * Simulate a job match notification (for premium users)
     * @param {Object} job - Matched job details
     */
    /**
     * Simulate a random notification (for testing)
     */
    simulateRandomNotification() {
        const types = [
            NOTIFICATION_TYPES.JOB_MATCH,
            NOTIFICATION_TYPES.APPLICATION_UPDATE,
            NOTIFICATION_TYPES.PROFILE_VIEW
        ];
        const type = types[Math.floor(Math.random() * types.length)];

        let notificationData = {};

        switch (type) {
            case NOTIFICATION_TYPES.JOB_MATCH:
                notificationData = {
                    type,
                    title: 'New Job Match!',
                    content: 'A new job "Senior React Developer" at TechCorp matches your profile.',
                    jobId: `job_${Date.now()}`,
                };
                break;
            case NOTIFICATION_TYPES.APPLICATION_UPDATE:
                const statuses = ['viewed', 'shortlisted', 'rejected', 'interview'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                notificationData = {
                    type,
                    title: 'Application Update',
                    content: `Your application for "Frontend Developer" has been ${status}.`,
                    applicationId: `app_${Date.now()}`,
                };
                break;
            case NOTIFICATION_TYPES.PROFILE_VIEW:
                notificationData = {
                    type,
                    title: 'Profile Viewed',
                    content: 'A recruiter from a top tech company viewed your profile.',
                    companyId: `comp_${Date.now()}`,
                };
                break;
        }

        return this.addMockNotification(notificationData);
    }

    /**
     * Get WebSocket URL for real-time notifications
     * @returns {string} WebSocket URL
     */
    getWebSocketUrl() {
        const baseUrl = API_BASE_URL.replace(/^http/, 'ws');
        return `${baseUrl}${API_ENDPOINTS.NOTIFICATIONS.WEBSOCKET}`;
    }

    /**
     * Get current user ID from auth token
     * @private
     */
    _getCurrentUserId() {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return null;

            // Decode JWT payload
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub;
        } catch (e) {
            console.error('Error getting user ID from token:', e);
            return null;
        }
    }

    /**
     * Format notification for display
     * @param {Object} notification - Raw notification
     * @returns {Object} Formatted notification
     */
    formatNotification(notification) {
        const timeAgo = this._getTimeAgo(notification.createdAt);

        const iconMap = {
            [NOTIFICATION_TYPES.JOB_MATCH]: '💼',
            [NOTIFICATION_TYPES.APPLICATION_UPDATE]: '📋',
            [NOTIFICATION_TYPES.PROFILE_VIEW]: '👁️',
            [NOTIFICATION_TYPES.SYSTEM]: '🔔',
            [NOTIFICATION_TYPES.SUBSCRIPTION]: '⭐',
        };

        return {
            ...notification,
            icon: iconMap[notification.type] || '🔔',
            timeAgo,
        };
    }

    /**
     * Get human-readable time ago
     * @private
     */
    _getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    /**
     * Helper to simulate network delay
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;


