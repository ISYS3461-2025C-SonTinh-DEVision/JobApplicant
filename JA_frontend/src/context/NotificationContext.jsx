import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import NotificationService from '../services/NotificationService';
import defaultSubscriptionService from '../services/SubscriptionService';
import { useHeadlessDataList } from '../components/headless';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    //HeadlessDataList to manage the notifications list state
    const {
        items: notifications,
        setItems: setNotifications,
        loading,
        error,
        fetchData: refreshNotifications,
        updateItem,
        removeItem,
        addItem,
    } = useHeadlessDataList({
        fetchFn: useCallback(async () => {
            const userId = currentUser?.id || 'guest';

            // Only fetch if we have a user OR we are in mock mode
            if (!userId && !NotificationService.useMock) return [];

            const response = await NotificationService.getNotifications(userId);
            if (response && response.notifications) {
                setUnreadCount(response.unreadCount || 0);
                return response.notifications;
            }
            return [];
        }, [currentUser]),
        fetchOnMount: false,
        idKey: 'id',
    });

    // Fetch subscription status to determine if user is premium
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const status = await defaultSubscriptionService.getSubscriptionStatus();
                if (status && status.data) {
                    setSubscriptionStatus(status.data);
                }
            } catch (err) {
                console.error("Failed to fetch subscription status", err);
            }
        };
        if (currentUser) {
            fetchSubscription();
        }
    }, [currentUser]);

    // Initial fetch when user is available
    useEffect(() => {
        if (currentUser?.id) {
            refreshNotifications();
            fetchUnreadCount();
        }
    }, [currentUser, refreshNotifications]);

    const fetchUnreadCount = async () => {
        if (!currentUser?.id) return;
        try {
            const response = await NotificationService.getUnreadCount(currentUser.id);
            if (response && response.unreadCount !== undefined) {
                setUnreadCount(response.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    };

    const markAsRead = async (id) => {
        // Optimistic update
        updateItem(id, { isRead: true });
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await NotificationService.markAsRead(id);
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        const userId = currentUser?.id || 'guest';
        if (!userId && !NotificationService.useMock) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            await NotificationService.markAllAsRead(userId);
            // Force refresh to ensure backend/mock state is fully synced
            refreshNotifications();
        } catch (error) {
            console.error('Failed to mark all as read', error);
            refreshNotifications(); // Revert on error
        }
    };

    const deleteNotification = async (id) => {
        // Optimistic update
        const item = notifications.find(n => n.id === id);
        removeItem(id);
        if (item && !item.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        try {
            await NotificationService.deleteNotification(id);
        } catch (error) {
            console.error('Failed to delete notification', error);
            refreshNotifications();
        }
    };

    const simulateNotification = async () => {
        const types = ['system_message', 'job_match', 'subscription_update'];
        const randomType = types[Math.floor(Math.random() * types.length)];

        const titles = {
            'system_message': 'System Maintenance Update',
            'job_match': 'New Job Match: Backend Developer',
            'subscription_update': 'Payment Successful'
        };

        const contents = {
            'system_message': 'We will be performing scheduled maintenance tonight at 2 AM UTC.',
            'job_match': 'A new job matching your "Java" skills has been posted by TechCorp.',
            'subscription_update': 'Your monthly subscription has been successfully renewed.'
        };

        const notificationData = {
            type: randomType,
            title: titles[randomType],
            content: contents[randomType],
            userId: currentUser?.id || 'guest'
        };

        try {
            // Create in backend/mock service to ensure persistence and correct state
            const created = await NotificationService.createNotification(notificationData);

            // Add to local list immediately
            addItem(created);
            setUnreadCount(prev => prev + 1);
        } catch (err) {
            console.error("Failed to simulate notification", err);
        }
    };

    const value = {
        notifications, // Use direct notifications list (no filtering)
        unreadCount,
        loading,
        error,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchUnreadCount,
        simulateNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
