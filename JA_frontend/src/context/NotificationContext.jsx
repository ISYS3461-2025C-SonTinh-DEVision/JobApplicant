
/**
 * Notification Context
 * 
 * Global state management for notifications.
 * Provides real-time notification updates via WebSocket.
 * Implements Requirement 5.3.1 for real-time notification service.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Context + Hook Pattern
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import notificationService, { NOTIFICATION_TYPES } from '../services/NotificationService';
import useWebSocket from '../hooks/useWebSocket';
import useStompClient from '../hooks/useStompClient';
import { useAuth } from '../hooks/useAuth';

// Context
const NotificationContext = createContext(null);

// Toast queue for displaying notifications
const MAX_TOASTS = 5;

/**
 * Notification Provider Component
 */
export function NotificationProvider({ children }) {
    const { currentUser, isAuthenticated } = useAuth();

    // Check if user is premium (real-time notifications only for premium)
    const isPremium = currentUser?.isPremium || currentUser?.subscriptionStatus === 'ACTIVE';

    // State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [checkingMatches, setCheckingMatches] = useState(false);
    const [error, setError] = useState(null);
    const [toasts, setToasts] = useState([]);

    // Refs
    const hasLoadedRef = useRef(false);

    /**
     * Internal toast show function (defined early for use in handleWebSocketMessage)
     */
    const showToastInternal = useCallback((toast) => {
        const newToast = {
            id: toast.id || `toast_${Date.now()}`,
            type: toast.type || 'info',
            title: toast.title,
            message: toast.message,
            action: toast.action,
            duration: toast.duration || 5000,
            createdAt: Date.now(),
        };

        setToasts(prev => {
            const updated = [newToast, ...prev];
            return updated.slice(0, MAX_TOASTS);
        });

        // Auto-dismiss
        if (newToast.duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, newToast.duration);
        }

        return newToast.id;
    }, []);

    /**
     * Get action button for notification type
     */
    const getNotificationAction = useCallback((notification) => {
        switch (notification.type) {
            case NOTIFICATION_TYPES.JOB_MATCH:
                return {
                    label: 'View Job',
                    href: `/dashboard/jobs/${notification.jobId}`,
                };
            case NOTIFICATION_TYPES.APPLICATION_UPDATE:
                return {
                    label: 'View Application',
                    href: `/dashboard/applications/${notification.applicationId}`,
                };
            default:
                return null;
        }
    }, []);

    /**
     * Handle incoming WebSocket messages
     */
    const handleWebSocketMessage = useCallback((data) => {
        // Handle admin action notifications (real-time alerts)
        if (data.type === 'ACCOUNT_DEACTIVATED') {
            // Dispatch event for AuthContext to handle forced logout
            window.dispatchEvent(new CustomEvent('auth:account-deactivated', {
                detail: {
                    message: data.message,
                    reason: data.reason,
                }
            }));
            return; // Don't add to regular notifications list
        }

        if (data.type === 'JOB_POST_DELETED' || data.type === 'COMPANY_DEACTIVATED') {
            // Dispatch event for pages to handle (e.g., if user is viewing that job/company)
            window.dispatchEvent(new CustomEvent('admin:resource-removed', {
                detail: {
                    type: data.type,
                    resourceId: data.resourceId,
                    message: data.message,
                }
            }));

            // Show info toast
            showToastInternal({
                id: `admin_action_${Date.now()}`,
                type: 'warning',
                title: data.type === 'JOB_POST_DELETED' ? 'Job Post Removed' : 'Company Deactivated',
                message: data.message,
                duration: 8000,
            });
            return;
        }

        // Handle regular notifications
        if (data.type === 'NOTIFICATION') {
            const notification = data.payload;

            // Add to notifications list
            setNotifications(prev => [notification, ...prev]);

            // Update unread count
            if (!notification.read) {
                setUnreadCount(prev => prev + 1);
            }

            // Show toast notification
            showToastInternal({
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.content,
                action: getNotificationAction(notification),
            });
        } else if (data.type === 'UNREAD_COUNT') {
            setUnreadCount(data.count);
        }
    }, [showToastInternal, getNotificationAction]);

    // WebSocket connection (for regular notifications)
    const {
        connectionState,
        isConnected,
        connect: wsConnect,
        disconnect: wsDisconnect,
    } = useWebSocket('/ws/notifications', {
        autoConnect: false,
        onMessage: handleWebSocketMessage,
        onOpen: () => console.log('[NotificationContext] WebSocket connected'),
        onClose: () => console.log('[NotificationContext] WebSocket disconnected'),
        onError: (e) => console.error('[NotificationContext] WebSocket error:', e),
    });

    /**
     * Handle admin action messages from STOMP
     */
    const handleAdminAction = useCallback((data) => {
        console.log('[NotificationContext] Admin action received via STOMP:', data);

        if (data.type === 'ACCOUNT_DEACTIVATED') {
            // Dispatch event for AuthContext to handle forced logout
            window.dispatchEvent(new CustomEvent('auth:account-deactivated', {
                detail: {
                    message: data.message,
                    reason: data.reason,
                }
            }));
        } else if (data.type === 'JOB_POST_DELETED' || data.type === 'COMPANY_DEACTIVATED') {
            // Dispatch event for pages to handle
            window.dispatchEvent(new CustomEvent('admin:resource-removed', {
                detail: {
                    type: data.type,
                    resourceId: data.resourceId,
                    message: data.message,
                }
            }));

            // Show toast
            showToastInternal({
                id: `admin_action_${Date.now()}`,
                type: 'warning',
                title: data.type === 'JOB_POST_DELETED' ? 'Job Post Removed' : 'Company Deactivated',
                message: data.message,
                duration: 8000,
            });
        }
    }, [showToastInternal]);

    // STOMP connection for admin action notifications (works for all authenticated users)
    const {
        isConnected: isStompConnected,
        connect: stompConnect,
        disconnect: stompDisconnect,
    } = useStompClient({
        autoConnect: false,
        messageHandlers: {
            onAdminAction: handleAdminAction,
            onNotification: (data) => {
                console.log('[NotificationContext] Real-time notification received via STOMP:', data);

                // Map backend NotificationResponse format to frontend format
                // Backend sends: { id, userId, title, content, timestamp, read, type, metadata }
                const notification = {
                    id: data.id || `notif_${Date.now()}`,
                    type: data.type || 'JOB_MATCH',
                    title: data.title || 'New Notification',
                    content: data.content || data.message || '',
                    read: data.read || false,
                    createdAt: data.timestamp || new Date().toISOString(),
                    // Preserve metadata for job match details (View Details modal)
                    metadata: data.metadata || {},
                    jobId: data.metadata?.jobPostId || data.jobId,
                };

                // Add to notifications list (prepend for newest first)
                setNotifications(prev => {
                    // Avoid duplicates
                    if (prev.some(n => n.id === notification.id)) {
                        return prev;
                    }
                    return [notification, ...prev];
                });

                // Update unread count
                if (!notification.read) {
                    setUnreadCount(prev => prev + 1);
                }

                // Show toast notification immediately - this is the real-time feedback!
                showToastInternal({
                    id: notification.id,
                    type: notification.type === 'JOB_MATCH' ? 'success' : notification.type,
                    title: notification.title,
                    message: notification.content,
                    duration: 8000, // Longer duration for important job match notifications
                    action: notification.jobId ? {
                        label: 'View Job',
                        href: `/dashboard/jobs/${notification.jobId}`,
                    } : null,
                });
            },
            onNotificationCount: (data) => {
                console.log('[NotificationContext] Unread count update:', data);
                setUnreadCount(data.unreadCount || 0);
            },
        },
        onConnect: () => {
            console.log('[NotificationContext] STOMP connected - Real-time notifications active!');
            // Refresh notifications when STOMP reconnects to get any missed notifications
            loadNotifications();
        },
        onDisconnect: () => console.log('[NotificationContext] STOMP disconnected'),
        onError: (e) => console.error('[NotificationContext] STOMP error:', e),
    });

    /**
     * Load notifications from API
     */
    const loadNotifications = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);

        try {
            const response = await notificationService.getNotifications();
            if (response.success) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (err) {
            console.error('[NotificationContext] Error loading notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    /**
     * Refresh unread count
     */
    const refreshUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('[NotificationContext] Error refreshing unread count:', err);
        }
    }, []);

    /**
     * Mark a notification as read
     */
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('[NotificationContext] Error marking as read:', err);
            throw err;
        }
    }, []);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();

            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );

            setUnreadCount(0);
        } catch (err) {
            console.error('[NotificationContext] Error marking all as read:', err);
            throw err;
        }
    }, []);

    /**
     * Delete a notification
     */
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            const notification = notifications.find(n => n.id === notificationId);
            await notificationService.deleteNotification(notificationId);

            setNotifications(prev => prev.filter(n => n.id !== notificationId));

            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('[NotificationContext] Error deleting notification:', err);
            throw err;
        }
    }, [notifications]);

    /**
     * Clear all notifications
     */
    const clearAllNotifications = useCallback(async () => {
        try {
            await notificationService.deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('[NotificationContext] Error clearing notifications:', err);
            throw err;
        }
    }, []);

    /**
     * Show a toast notification
     */
    const showToast = useCallback((toast) => {
        return showToastInternal(toast);
    }, [showToastInternal]);

    /**
     * Dismiss a toast notification
     */
    const dismissToast = useCallback((toastId) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
    }, []);

    /**
     * Show success toast
     */
    const showSuccess = useCallback((title, message, options = {}) => {
        return showToastInternal({
            type: 'success',
            title,
            message,
            ...options,
        });
    }, [showToastInternal]);

    /**
     * Show error toast
     */
    const showError = useCallback((title, message, options = {}) => {
        return showToastInternal({
            type: 'error',
            title,
            message,
            duration: 8000,
            ...options,
        });
    }, [showToastInternal]);

    /**
     * Show info toast
     */
    const showInfo = useCallback((title, message, options = {}) => {
        return showToastInternal({
            type: 'info',
            title,
            message,
            ...options,
        });
    }, [showToastInternal]);

    /**
     * Check for job matches manually (for non-premium users)
     * Calls backend to check if any jobs match user's search profile
     */
    const checkForJobMatches = useCallback(async () => {
        setCheckingMatches(true);
        try {
            const response = await notificationService.checkJobMatches();
            if (response.success && response.data?.length > 0) {
                // Add new job match notifications
                const newNotifications = response.data.map(match => ({
                    id: `match_${match.jobId}_${Date.now()}`,
                    type: NOTIFICATION_TYPES.JOB_MATCH,
                    title: 'Job Match Found!',
                    content: `"${match.jobTitle}" at ${match.companyName} matches your profile.`,
                    jobId: match.jobId,
                    read: false,
                    createdAt: new Date().toISOString(),
                }));

                setNotifications(prev => [...newNotifications, ...prev]);
                setUnreadCount(prev => prev + newNotifications.length);

                showToastInternal({
                    type: 'success',
                    title: 'Matches Found!',
                    message: `Found ${newNotifications.length} job(s) matching your profile.`,
                });

                return { found: true, count: newNotifications.length };
            } else {
                showToastInternal({
                    type: 'info',
                    title: 'No New Matches',
                    message: 'No new jobs match your search profile right now.',
                });
                return { found: false, count: 0 };
            }
        } catch (err) {
            console.error('[NotificationContext] Error checking for matches:', err);
            showToastInternal({
                type: 'error',
                title: 'Error',
                message: 'Failed to check for job matches.',
            });
            throw err;
        } finally {
            setCheckingMatches(false);
        }
    }, [showToastInternal]);

    // Connect to WebSocket when authenticated (only for premium users)
    // Connect to STOMP for ALL authenticated users (admin action notifications)
    useEffect(() => {
        if (isAuthenticated && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadNotifications();
            // Connect STOMP for ALL users (admin action notifications like deactivation)
            stompConnect();
            // Only connect regular WebSocket for premium users
            if (isPremium) {
                wsConnect();
            }
        }
    }, [isAuthenticated, isPremium, loadNotifications, wsConnect, stompConnect]);

    // Handle logout - reset state when auth changes to false
    useEffect(() => {
        if (!isAuthenticated && hasLoadedRef.current) {
            hasLoadedRef.current = false;
            setNotifications([]);
            setUnreadCount(0);
            wsDisconnect();
            stompDisconnect();
        }
    }, [isAuthenticated, wsDisconnect, stompDisconnect]);

    // Subscribe to service notifications
    useEffect(() => {
        const unsubscribe = notificationService.subscribe((notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            showToastInternal({
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.content,
                action: getNotificationAction(notification),
            });
        });

        return unsubscribe;
    }, [showToastInternal]);

    const value = {
        // State
        notifications,
        unreadCount,
        loading,
        checkingMatches,
        error,
        toasts,

        // User status
        isPremium,

        // WebSocket state
        connectionState,
        isConnected,

        // Methods
        loadNotifications,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        checkForJobMatches,

        // Toast methods
        showToast,
        dismissToast,
        showSuccess,
        showError,
        showInfo,

        // For testing/demo
        simulateNotification: notificationService.simulateRandomNotification.bind(notificationService),
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

/**
 * Hook to use notification context
 */
export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }

    return context;
}

export default NotificationContext;
