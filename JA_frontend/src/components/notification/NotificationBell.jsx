/**
 * Notification Bell Component
 * 
 * Header notification bell with unread badge and dropdown panel.
 * Uses Headless UI hooks for behavior logic.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Check, CheckCheck, Trash2, ExternalLink,
    Briefcase, FileText, Eye, Settings, X
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { NOTIFICATION_TYPES } from '../../services/NotificationService';

/**
 * Get icon for notification type
 */
function getNotificationIcon(type) {
    switch (type) {
        case NOTIFICATION_TYPES.JOB_MATCH:
            return Briefcase;
        case NOTIFICATION_TYPES.APPLICATION_UPDATE:
            return FileText;
        case NOTIFICATION_TYPES.PROFILE_VIEW:
            return Eye;
        default:
            return Bell;
    }
}

/**
 * Get color for notification type
 */
function getNotificationColor(type, isDark) {
    const colors = {
        [NOTIFICATION_TYPES.JOB_MATCH]: {
            bg: isDark ? 'bg-primary-500/20' : 'bg-primary-100',
            text: isDark ? 'text-primary-400' : 'text-primary-600',
        },
        [NOTIFICATION_TYPES.APPLICATION_UPDATE]: {
            bg: isDark ? 'bg-accent-500/20' : 'bg-accent-100',
            text: isDark ? 'text-accent-400' : 'text-accent-600',
        },
        [NOTIFICATION_TYPES.PROFILE_VIEW]: {
            bg: isDark ? 'bg-green-500/20' : 'bg-green-100',
            text: isDark ? 'text-green-400' : 'text-green-600',
        },
        default: {
            bg: isDark ? 'bg-dark-600' : 'bg-gray-100',
            text: isDark ? 'text-dark-300' : 'text-gray-600',
        },
    };
    return colors[type] || colors.default;
}

/**
 * Single Notification Item
 */
function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }) {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const Icon = getNotificationIcon(notification.type);
    const color = getNotificationColor(notification.type, isDark);

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.jobId) {
            navigate(`/dashboard/jobs/${notification.jobId}`);
        } else if (notification.applicationId) {
            navigate(`/dashboard/applications/${notification.applicationId}`);
        }

        onClick?.();
    };

    return (
        <div
            className={`
        group relative flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
        ${notification.read
                    ? isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'
                    : isDark ? 'bg-primary-500/5 hover:bg-primary-500/10' : 'bg-primary-50/50 hover:bg-primary-50'
                }
      `}
            onClick={handleClick}
        >
            {/* Unread indicator */}
            {!notification.read && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            )}

            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color.text}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {notification.title}
                </p>
                <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    {notification.content}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                    {notification.timeAgo || formatTimeAgo(notification.createdAt)}
                </p>
            </div>

            {/* Actions - appear on hover */}
            <div className={`
        flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity
      `}>
                {!notification.read && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}
                        className={`p-1.5 rounded-lg transition-colors ${isDark
                                ? 'hover:bg-dark-600 text-dark-400 hover:text-primary-400'
                                : 'hover:bg-gray-100 text-gray-400 hover:text-primary-600'
                            }`}
                        title="Mark as read"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                    className={`p-1.5 rounded-lg transition-colors ${isDark
                            ? 'hover:bg-red-500/10 text-dark-400 hover:text-red-400'
                            : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                        }`}
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/**
 * Format time ago
 */
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: 'y', seconds: 31536000 },
        { label: 'mo', seconds: 2592000 },
        { label: 'w', seconds: 604800 },
        { label: 'd', seconds: 86400 },
        { label: 'h', seconds: 3600 },
        { label: 'm', seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label} ago`;
        }
    }

    return 'Just now';
}

/**
 * Notification Bell Component
 */
export default function NotificationBell() {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape
    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const recentNotifications = notifications.slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          relative p-2 rounded-xl transition-all duration-200
          ${isOpen
                        ? isDark ? 'bg-dark-700 text-primary-400' : 'bg-primary-50 text-primary-600'
                        : isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }
        `}
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className={`
          absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50
          animate-scale-in origin-top-right
          ${isDark
                        ? 'bg-dark-800 border-dark-700'
                        : 'bg-white border-gray-200'
                    }
        `}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-100 text-primary-700'}
                `}>
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${isDark
                                            ? 'text-primary-400 hover:bg-primary-500/10'
                                            : 'text-primary-600 hover:bg-primary-50'
                                        }`}
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`p-2 rounded-lg transition-colors ${isDark
                                        ? 'text-dark-400 hover:text-white hover:bg-dark-700'
                                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : recentNotifications.length > 0 ? (
                            <div className="space-y-1">
                                {recentNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                        onDelete={deleteNotification}
                                        onClick={() => setIsOpen(false)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Bell className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-dark-600' : 'text-gray-300'}`} />
                                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                    No notifications yet
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 5 && (
                        <div className={`p-3 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // Navigate to full notifications page
                                }}
                                className={`
                  w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors
                  ${isDark
                                        ? 'text-primary-400 hover:bg-primary-500/10'
                                        : 'text-primary-600 hover:bg-primary-50'
                                    }
                `}
                            >
                                View all notifications
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export { NotificationItem, getNotificationIcon, getNotificationColor };
