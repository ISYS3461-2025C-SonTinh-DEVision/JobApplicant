/**
 * HeadlessNotification Hook
 * 
 * Manages notification/toast state without UI rendering.
 * Supports: multiple notifications, auto-dismiss, different types.
 * 
 * Usage:
 * const { notifications, addNotification, removeNotification, clearAll } = useHeadlessNotification();
 * addNotification({ type: 'success', message: 'Saved!' });
 */

import { useState, useCallback, useRef, useEffect } from "react";

let notificationId = 0;

export default function useHeadlessNotification({
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'top-right',
} = {}) {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef({});

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  // Add notification
  const addNotification = useCallback(({
    type = 'info',
    title,
    message,
    duration = defaultDuration,
    dismissible = true,
    action = null,
  }) => {
    const id = ++notificationId;

    const notification = {
      id,
      type,
      title,
      message,
      dismissible,
      action,
      createdAt: Date.now(),
    };

    setNotifications((prev) => {
      // Remove oldest if at max
      const updated = prev.length >= maxNotifications 
        ? prev.slice(1) 
        : prev;
      return [...updated, notification];
    });

    // Auto-dismiss after duration
    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [defaultDuration, maxNotifications, removeNotification]);

  // Convenience methods for different notification types
  const success = useCallback((message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({ type: 'error', message, duration: 0, ...options });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    setNotifications([]);
  }, []);

  // Update notification
  const updateNotification = useCallback((id, updates) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  }, []);

  // Get notification props helper
  const getNotificationProps = useCallback((notification) => ({
    key: notification.id,
    role: 'alert',
    'aria-live': notification.type === 'error' ? 'assertive' : 'polite',
    onDismiss: notification.dismissible 
      ? () => removeNotification(notification.id) 
      : undefined,
  }), [removeNotification]);

  return {
    notifications,
    position,
    
    // Actions
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,
    
    // Convenience methods
    success,
    error,
    warning,
    info,
    
    // Helpers
    getNotificationProps,
    hasNotifications: notifications.length > 0,
    count: notifications.length,
  };
}

