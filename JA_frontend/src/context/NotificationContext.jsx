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

    // State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toasts, setToasts] = useState([]);

    // Refs
    const hasLoadedRef = useRef(false);

    /**
     * Handle incoming WebSocket messages
     */
    const handleWebSocketMessage = useCallback((data) => {
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
    }, []);

    // WebSocket connection
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
     * Get action button for notification type
     */
    function getNotificationAction(notification) {
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
    }

    /**
     * Internal toast show function
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

    // Load notifications on auth change
    useEffect(() => {
        if (isAuthenticated && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadNotifications();
            wsConnect();
        }

        return () => {
            if (!isAuthenticated) {
                hasLoadedRef.current = false;
                setNotifications([]);
                setUnreadCount(0);
                wsDisconnect();
            }
        };
    }, [isAuthenticated, loadNotifications, wsConnect, wsDisconnect]);

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
        error,
        toasts,

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

        // Toast methods
        showToast,
        dismissToast,
        showSuccess,
        showError,
        showInfo,

        // For testing/demo
        simulateNotification: notificationService.simulateJobMatchNotification.bind(notificationService),
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
