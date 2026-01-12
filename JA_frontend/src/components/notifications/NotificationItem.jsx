/**
 * NotificationItem Component
 * 
 * Beautiful, modern notification item with smooth animations.
 * Follows Headless UI pattern with premium visual design.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Premium UI Design
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, Check, Trash2, ExternalLink,
    Briefcase, FileText, Eye, Star, AlertCircle,
    ChevronRight, Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { NOTIFICATION_TYPES } from '../../services/NotificationService';
import JobMatchDetailModal from './JobMatchDetailModal';

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
        case NOTIFICATION_TYPES.SUBSCRIPTION:
            return Star;
        case NOTIFICATION_TYPES.SYSTEM:
            return AlertCircle;
        default:
            return Bell;
    }
}

/**
 * Get color scheme for notification type
 */
export function getNotificationStyles(type, isDark) {
    const styles = {
        [NOTIFICATION_TYPES.JOB_MATCH]: {
            gradient: isDark
                ? 'from-violet-500/20 to-fuchsia-500/20'
                : 'from-violet-50 to-fuchsia-50',
            iconBg: isDark ? 'bg-violet-500/30' : 'bg-violet-100',
            iconColor: isDark ? 'text-violet-400' : 'text-violet-600',
            accent: isDark ? 'border-violet-500/30' : 'border-violet-200',
            badge: isDark ? 'bg-violet-500' : 'bg-violet-500',
        },
        [NOTIFICATION_TYPES.APPLICATION_UPDATE]: {
            gradient: isDark
                ? 'from-blue-500/20 to-cyan-500/20'
                : 'from-blue-50 to-cyan-50',
            iconBg: isDark ? 'bg-blue-500/30' : 'bg-blue-100',
            iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
            accent: isDark ? 'border-blue-500/30' : 'border-blue-200',
            badge: isDark ? 'bg-blue-500' : 'bg-blue-500',
        },
        [NOTIFICATION_TYPES.PROFILE_VIEW]: {
            gradient: isDark
                ? 'from-emerald-500/20 to-teal-500/20'
                : 'from-emerald-50 to-teal-50',
            iconBg: isDark ? 'bg-emerald-500/30' : 'bg-emerald-100',
            iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
            accent: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
            badge: isDark ? 'bg-emerald-500' : 'bg-emerald-500',
        },
        [NOTIFICATION_TYPES.SUBSCRIPTION]: {
            gradient: isDark
                ? 'from-amber-500/20 to-orange-500/20'
                : 'from-amber-50 to-orange-50',
            iconBg: isDark ? 'bg-amber-500/30' : 'bg-amber-100',
            iconColor: isDark ? 'text-amber-400' : 'text-amber-600',
            accent: isDark ? 'border-amber-500/30' : 'border-amber-200',
            badge: isDark ? 'bg-amber-500' : 'bg-amber-500',
        },
        default: {
            gradient: isDark
                ? 'from-gray-500/10 to-gray-600/10'
                : 'from-gray-50 to-gray-100',
            iconBg: isDark ? 'bg-gray-500/30' : 'bg-gray-200',
            iconColor: isDark ? 'text-gray-400' : 'text-gray-600',
            accent: isDark ? 'border-gray-600' : 'border-gray-200',
            badge: isDark ? 'bg-gray-500' : 'bg-gray-500',
        },
    };
    return styles[type] || styles.default;
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
        { label: 'year', plural: 'years', seconds: 31536000 },
        { label: 'month', plural: 'months', seconds: 2592000 },
        { label: 'week', plural: 'weeks', seconds: 604800 },
        { label: 'day', plural: 'days', seconds: 86400 },
        { label: 'hour', plural: 'hours', seconds: 3600 },
        { label: 'minute', plural: 'minutes', seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${count > 1 ? interval.plural : interval.label} ago`;
        }
    }

    return 'Just now';
}

/**
 * Get notification label
 */
function getNotificationLabel(type) {
    switch (type) {
        case NOTIFICATION_TYPES.JOB_MATCH:
            return 'Job Match';
        case NOTIFICATION_TYPES.APPLICATION_UPDATE:
            return 'Application';
        case NOTIFICATION_TYPES.PROFILE_VIEW:
            return 'Profile View';
        case NOTIFICATION_TYPES.SUBSCRIPTION:
            return 'Subscription';
        case NOTIFICATION_TYPES.SYSTEM:
            return 'System';
        default:
            return 'Notification';
    }
}

/**
 * Beautiful Notification Item Component
 */
export default function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    onClick,
    compact = false
}) {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showMatchDetails, setShowMatchDetails] = useState(false);

    const Icon = getNotificationIcon(notification.type);
    const styles = getNotificationStyles(notification.type, isDark);
    const timeAgo = notification.timeAgo || formatTimeAgo(notification.createdAt || notification.timestamp);
    const label = getNotificationLabel(notification.type);

    // Check if this is a job match notification with match data
    const isJobMatch = notification.type === NOTIFICATION_TYPES.JOB_MATCH;
    const hasMatchData = notification.matchData || notification.metadata?.matchData;

    const handleClick = () => {
        onClick?.();

        // Navigate based on notification type
        if (notification.jobId) {
            navigate(`/dashboard/jobs/${notification.jobId}`);
        } else if (notification.applicationId) {
            navigate(`/dashboard/applications/${notification.applicationId}`);
        }

        // Mark as read on click
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        setShowMatchDetails(true);
        // Mark as read when viewing details
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const handleMarkAsRead = (e) => {
        e.stopPropagation();
        if (onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (onDelete) {
            setIsDeleting(true);
            try {
                await onDelete(notification.id);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (compact) {
        // Compact version for dropdown
        return (
            <div
                className={`
                    flex gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${notification.read
                        ? isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'
                        : isDark ? 'bg-dark-700/30' : 'bg-primary-50/50'
                    }
                `}
                onClick={handleClick}
            >
                <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${styles.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {notification.title}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                        {timeAgo}
                    </p>
                </div>
                {!notification.read && (
                    <div className={`w-2 h-2 rounded-full ${styles.badge} flex-shrink-0 mt-2`} />
                )}
            </div>
        );
    }

    // Full version for notifications page
    return (
        <div
            className={`
                group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out
                ${notification.read
                    ? isDark
                        ? 'bg-dark-800/50 border-dark-700 hover:border-dark-600 hover:bg-dark-800'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    : isDark
                        ? `bg-gradient-to-r ${styles.gradient} border-transparent hover:scale-[1.01]`
                        : `bg-gradient-to-r ${styles.gradient} border-transparent hover:shadow-lg hover:scale-[1.01]`
                }
                ${isDeleting ? 'opacity-50 scale-95' : ''}
            `}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'pointer' }}
        >
            {/* Unread indicator line */}
            {!notification.read && (
                <div className={`absolute top-0 left-0 w-1 h-full ${styles.badge} rounded-l-2xl`} />
            )}

            <div className="p-4 sm:p-5">
                <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`
                        w-12 h-12 rounded-xl ${styles.iconBg} 
                        flex items-center justify-center flex-shrink-0
                        transition-transform duration-300
                        ${isHovered ? 'scale-110' : ''}
                    `}>
                        <Icon className={`w-6 h-6 ${styles.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                {/* Type label */}
                                <span className={`
                                    inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5
                                    ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-900/5 text-gray-500'}
                                `}>
                                    {label}
                                </span>

                                {/* Title */}
                                <h3 className={`
                                    text-base font-semibold leading-snug
                                    ${isDark ? 'text-white' : 'text-gray-900'}
                                `}>
                                    {notification.title}
                                </h3>
                            </div>

                            {/* Time */}
                            <span className={`
                                text-xs flex-shrink-0 mt-1
                                ${isDark ? 'text-dark-500' : 'text-gray-400'}
                            `}>
                                {timeAgo}
                            </span>
                        </div>

                        {/* Content */}
                        <p className={`
                            text-sm mt-2 leading-relaxed
                            ${isDark ? 'text-dark-300' : 'text-gray-600'}
                        `}>
                            {notification.content}
                        </p>

                        {/* Actions */}
                        <div className={`
                            flex items-center gap-2 mt-4 pt-3 border-t flex-wrap
                            ${isDark ? 'border-white/10' : 'border-gray-100'}
                        `}>
                            {/* View Details for Job Match */}
                            {isJobMatch && (
                                <button
                                    onClick={handleViewDetails}
                                    className={`
                                        flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                                        transition-all duration-200 transform hover:scale-105
                                        bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white
                                        shadow-md shadow-violet-500/25 hover:shadow-violet-500/40
                                    `}
                                >
                                    <Info className="w-4 h-4" />
                                    View Details
                                </button>
                            )}

                            {/* Mark as read */}
                            {!notification.read && onMarkAsRead && (
                                <button
                                    onClick={handleMarkAsRead}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                                        transition-all duration-200
                                        ${isDark
                                            ? 'text-emerald-400 hover:bg-emerald-500/20'
                                            : 'text-emerald-600 hover:bg-emerald-50'
                                        }
                                    `}
                                >
                                    <Check className="w-4 h-4" />
                                    Mark Read
                                </button>
                            )}

                            {/* Delete */}
                            {onDelete && (
                                <button
                                    onClick={handleDelete}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                                        transition-all duration-200 ml-auto
                                        ${isDark
                                            ? 'text-red-400 hover:bg-red-500/20'
                                            : 'text-red-500 hover:bg-red-50'
                                        }
                                    `}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Match Detail Modal */}
            {isJobMatch && (
                <JobMatchDetailModal
                    isOpen={showMatchDetails}
                    onClose={() => setShowMatchDetails(false)}
                    matchData={notification.matchData || notification.metadata?.matchData || {
                        // Fallback: parse data from notification if no matchData object
                        jobTitle: notification.title?.replace(/^New Job Match! \d+% Match$/, '').trim() ||
                            notification.content?.match(/Job: ([^in]+)/)?.[1]?.trim() || 'Job Match',
                        jobDescription: notification.content || '',
                        location: notification.content?.match(/in ([^.]+)\./)?.[1]?.trim() || 'Unknown',
                        matchScore: parseFloat(notification.title?.match(/(\d+)%/)?.[1] || '0') ||
                            notification.matchScore || 85,
                        matchedSkills: notification.content?.match(/Matched skills: ([^.]+)/)?.[1]?.split(', ') || [],
                        requiredSkills: notification.content?.match(/Matched skills: ([^.]+)/)?.[1]?.split(', ') || [],
                        employmentTypes: notification.employmentTypes || [],
                        salaryMin: notification.salaryMin,
                        salaryMax: notification.salaryMax,
                        salaryCurrency: notification.salaryCurrency || 'USD',
                        postedDate: notification.postedDate || notification.createdAt,
                        jobPostId: notification.jobId || notification.jobPostId,
                    }}
                />
            )}
        </div>
    );
}

