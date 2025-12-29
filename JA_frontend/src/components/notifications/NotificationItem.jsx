import React from 'react';
import { Bell, Briefcase, Crown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const getIcon = (type) => {
    switch (type) {
        case 'job_match':
            return <Briefcase className="w-5 h-5 text-purple-500" />;
        case 'subscription_update':
            return <Crown className="w-5 h-5 text-amber-500" />;
        case 'system_message':
        default:
            return <Bell className="w-5 h-5 text-blue-500" />;
    }
};

const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
};

const NotificationItem = ({ notification, isSelectionMode, isSelected, onSelect }) => {
    const { isDark } = useTheme();

    // Format timestamp
    const timeAgo = formatTimeAgo(notification.timestamp);

    const handleClick = () => {
        if (isSelectionMode) {
            onSelect(notification.id);
        }
    };

    return (
        <div
            className={`
        relative p-4 rounded-xl border transition-all duration-200 group
        ${isSelected
                    ? isDark ? 'bg-primary-900/20 border-primary-500/50' : 'bg-primary-50 border-primary-200'
                    : notification.isRead
                        ? isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
                        : isDark
                            ? 'bg-dark-700/50 border-primary-500/20'
                            : 'bg-blue-50 border-blue-100'
                }
        ${isSelectionMode ? 'cursor-pointer hover:border-primary-500' : ''}
        hover:shadow-md
      `}
            onClick={handleClick}
        >
            <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                {isSelectionMode && (
                    <div className="flex-shrink-0 pt-1">
                        <div className={`
                            w-5 h-5 rounded border flex items-center justify-center transition-all
                            ${isSelected
                                ? 'bg-primary-500 border-primary-500'
                                : isDark ? 'border-dark-600 bg-dark-700' : 'border-gray-300 bg-white'
                            }
                        `}>
                            {isSelected && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                )}

                {/* Icon */}
                <div className={`
                    relative p-2.5 rounded-full flex-shrink-0
                    ${isDark ? 'bg-dark-700' : 'bg-white shadow-sm'}
                `}>
                    {getIcon(notification.type)}
                    {!notification.isRead && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`
              text-sm font-semibold mb-1
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
                            {notification.title}
                        </h4>

                        {/* Timestamp */}
                        <span className={`
              text-xs whitespace-nowrap
              ${isDark ? 'text-dark-400' : 'text-gray-400'}
            `}>
                            {timeAgo}
                        </span>
                    </div>

                    <p className={`
            text-sm leading-relaxed mb-2
            ${isDark ? 'text-dark-300' : 'text-gray-600'}
          `}>
                        {notification.content}
                    </p>

                    {!notification.isRead && (
                        <div className="inline-flex items-center gap-1 text-xs font-medium text-primary-500">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            New
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
