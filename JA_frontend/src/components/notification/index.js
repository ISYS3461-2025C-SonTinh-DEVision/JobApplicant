/**
 * Notification Components Index
 * 
 * Export all notification-related components for easy imports.
 * Architecture: A.2.b Componentized Frontend
 */

export { default as NotificationBell } from './NotificationBell';
export { default as NotificationItem, getNotificationIcon, getNotificationColor } from '../notifications/NotificationItem';
export { default as ToastContainer, Toast, getToastConfig } from './ToastNotification';
