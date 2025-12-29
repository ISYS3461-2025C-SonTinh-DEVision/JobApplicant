import httpUtil from '../utils/httpUtil';

const MOCK_NOTIFICATIONS = [
    {
        id: 'notif_001',
        type: 'system_message',
        title: 'Welcome to Job Applicant',
        content: 'Thank you for joining our platform. Complete your profile to get started.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        isRead: true,
        userId: 'user_001'
    },
    {
        id: 'notif_002',
        type: 'job_match',
        title: 'New Job Match: Senior React Developer',
        content: 'We found a new job that matches your profile skills: React, Node.js.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        isRead: false,
        userId: 'user_001'
    },
    {
        id: 'notif_003',
        type: 'subscription_update',
        title: 'Premium Logic Active',
        content: 'This notification is visible because you are simulating or have a subscription.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        isRead: false,
        userId: 'user_001'
    }
];

/**
 * Service for managing notifications
 */
const NotificationService = {
    useMock: true, // Toggle this to force mock data or fallback

    /**
     * Get all notifications for a user
     * @param {string} userId 
     * @returns {Promise<Object>}
     */
    getNotifications: async (userId) => {
        try {
            if (NotificationService.useMock) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 300));

                // Sort by timestamp desc
                const sorted = [...MOCK_NOTIFICATIONS].sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );

                const unreadCount = sorted.filter(n => !n.isRead).length;
                return {
                    notifications: sorted,
                    unreadCount,
                    totalCount: sorted.length
                };
            }
            return await httpUtil.get(`/api/notifications/user/${userId}`);
        } catch (error) {
            console.warn('Error fetching notifications, falling back to mock:', error);
            // Fallback
            const sorted = [...MOCK_NOTIFICATIONS].sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            const unreadCount = sorted.filter(n => !n.isRead).length;
            return {
                notifications: sorted,
                unreadCount,
                totalCount: sorted.length
            };
        }
    },

    /**
     * Create a notification (Used for simulation)
     * @param {Object} notificationData 
     * @returns {Promise<Object>}
     */
    createNotification: async (notificationData) => {
        try {
            if (NotificationService.useMock) {
                const newNotification = {
                    ...notificationData,
                    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    isRead: false
                };
                MOCK_NOTIFICATIONS.unshift(newNotification);
                return newNotification;
            }
            return await httpUtil.post('/api/notifications', notificationData);
        } catch (error) {
            console.warn('Error creating notification, using mock fallback');
            const newNotification = {
                ...notificationData,
                id: `notif_${Date.now()}`,
                timestamp: new Date().toISOString(),
                isRead: false
            };
            MOCK_NOTIFICATIONS.unshift(newNotification);
            return newNotification;
        }
    },

    /**
     * Get unread count
     * @param {string} userId
     * @returns {Promise<Object>} { unreadCount: number }
     */
    getUnreadCount: async (userId) => {
        try {
            if (NotificationService.useMock) {
                return { unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length };
            }
            return await httpUtil.get(`/api/notifications/user/${userId}/unread-count`);
        } catch (error) {
            return { unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length };
        }
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId
     * @returns {Promise<Object>}
     */
    markAsRead: async (notificationId) => {
        try {
            if (NotificationService.useMock) {
                const notif = MOCK_NOTIFICATIONS.find(n => n.id === notificationId);
                if (notif) notif.isRead = true;
                return { success: true };
            }
            return await httpUtil.patch(`/api/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read for a user
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    markAllAsRead: async (userId) => {
        try {
            if (NotificationService.useMock) {
                MOCK_NOTIFICATIONS.forEach(n => n.isRead = true);
                return { success: true };
            }
            return await httpUtil.patch(`/api/notifications/user/${userId}/read-all`);
        } catch (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    },

    /**
     * Delete a notification
     * @param {string} notificationId
     * @returns {Promise<Object>}
     */
    deleteNotification: async (notificationId) => {
        try {
            if (NotificationService.useMock) {
                const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
                if (index !== -1) MOCK_NOTIFICATIONS.splice(index, 1);
                return { success: true };
            }
            return await httpUtil.delete(`/api/notifications/${notificationId}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};

export default NotificationService;
