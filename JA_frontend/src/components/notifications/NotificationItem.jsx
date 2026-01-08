import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Check, Trash2,
    Briefcase, FileText, Eye
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { NOTIFICATION_TYPES } from '../../services/NotificationService';

/**
 * Get icon for notification type
 */
export function getNotificationIcon(type) {
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
export function getNotificationColor(type, isDark) {
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
    // Helper to safely handle undefined/null types
    return colors[type] || colors.default;
}

/**
 * Format time ago
 */
export function formatTimeAgo(dateString) {
    if (!dateString) return '';
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
 * Single Notification Item
 */
export default function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }) {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const Icon = getNotificationIcon(notification.type);
    const color = getNotificationColor(notification.type, isDark);

    const handleClick = () => {
        // If passed generic onClick, call it (e.g. to close dropdown)
        onClick?.();

        // Navigate based on notification type if not handled externally
        if (notification.jobId) {
            navigate(`/dashboard/jobs/${notification.jobId}`);
        } else if (notification.applicationId) {
            navigate(`/dashboard/applications/${notification.applicationId}`);
        }
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
                    {notification.timeAgo || formatTimeAgo(notification.createdAt || notification.timestamp)}
                </p>
            </div>

            {/* Actions - appear on hover */}
            <div className={`
                flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity
                ${window.matchMedia('(hover: none)').matches ? 'opacity-100' : ''} 
            `}>
                {!notification.read && onMarkAsRead && (
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

            </div>
        </div>
    );
}
