/**
 * Notifications Page
 * 
 * Display and manage all notifications for the user.
 * Features:
 * - Premium users: Real-time WebSocket connection status
 * - Regular users: "Check for New Matches" button for manual checking
 * - All users: View, read, delete notifications
 * 
 * Architecture: A.3.a (Ultimo) - Uses Headless UI patterns
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCheck, BellOff, RefreshCw, Wifi, WifiOff, Crown,
    Loader2, Target, ArrowRight
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationItem from '../../components/notifications/NotificationItem';

/**
 * Connection Status Badge Component
 */
const ConnectionStatusBadge = ({ isConnected, isDark }) => {
    if (isConnected) {
        return (
            <span className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                ${isDark
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }
            `}>
                <Wifi className="w-3.5 h-3.5" />
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Real-time Active
            </span>
        );
    }
    return (
        <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            ${isDark
                ? 'bg-dark-700 text-dark-400 border border-dark-600'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }
        `}>
            <WifiOff className="w-3.5 h-3.5" />
            Disconnected
        </span>
    );
};

/**
 * Premium Status Banner
 */
const PremiumBanner = ({ isPremium, isConnected, onCheckMatches, checkingMatches, isDark }) => {
    const navigate = useNavigate();

    if (isPremium) {
        return (
            <div className={`
                p-4 rounded-xl border flex items-center justify-between gap-4 flex-wrap
                ${isDark
                    ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/30'
                    : 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
                }
            `}>
                <div className="flex items-center gap-3">
                    <Crown className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        Premium • Real-time Notifications
                    </span>
                </div>
                <ConnectionStatusBadge isConnected={isConnected} isDark={isDark} />
            </div>
        );
    }

    return (
        <div className={`
            p-4 rounded-xl border
            ${isDark ? 'bg-dark-800/50 border-dark-600' : 'bg-gray-50 border-gray-200'}
        `}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Target className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                    <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Manual Matching Mode
                        </p>
                        <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            Click the button to check for new job matches
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCheckMatches}
                        disabled={checkingMatches}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                            ${checkingMatches
                                ? 'bg-primary-600/50 text-white/70 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50'
                            }
                        `}
                    >
                        {checkingMatches ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Check for Matches
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/subscription')}
                        className={`
                            flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                            ${isDark
                                ? 'text-amber-400 hover:bg-amber-500/10'
                                : 'text-amber-600 hover:bg-amber-50'
                            }
                        `}
                    >
                        Upgrade
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function NotificationsPage() {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loading,
        checkingMatches,
        checkForJobMatches,
        isPremium,
        isConnected,
        simulateNotification
    } = useNotifications();
    const { isDark } = useTheme();
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'

    const filteredList = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    // Handle check for matches
    const handleCheckMatches = async () => {
        try {
            await checkForJobMatches();
        } catch (err) {
            console.error('Failed to check for matches:', err);
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    Loading notifications...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                    </h1>
                    <p className={`mt-1 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                    {/* Simulate Button (for demo purposes) */}
                    <button
                        onClick={simulateNotification}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-dashed
                            ${isDark
                                ? 'border-dark-600 text-dark-400 hover:text-white hover:border-primary-500'
                                : 'border-gray-300 text-gray-500 hover:text-primary-600 hover:border-primary-500'
                            }
                        `}
                    >
                        Simulate
                    </button>

                    {/* Setup Search Profile */}
                    <button
                        onClick={() => navigate('/dashboard/search-profile')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                            ${isDark
                                ? 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                        `}
                    >
                        <Target className="w-4 h-4" />
                        Search Profile
                    </button>
                </div>
            </div>

            {/* Premium Status Banner */}
            <PremiumBanner
                isPremium={isPremium}
                isConnected={isConnected}
                onCheckMatches={handleCheckMatches}
                checkingMatches={checkingMatches}
                isDark={isDark}
            />

            {/* Tabs / Filters & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className={`
                    flex items-center gap-2 p-1 rounded-xl w-fit
                    ${isDark ? 'bg-dark-800' : 'bg-gray-100'}
                `}>
                    <button
                        onClick={() => setFilter('all')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${filter === 'all'
                                ? isDark
                                    ? 'bg-dark-700 text-white shadow-sm'
                                    : 'bg-white text-gray-900 shadow-sm'
                                : isDark
                                    ? 'text-dark-400 hover:text-dark-200'
                                    : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${filter === 'unread'
                                ? isDark
                                    ? 'bg-dark-700 text-white shadow-sm'
                                    : 'bg-white text-gray-900 shadow-sm'
                                : isDark
                                    ? 'text-dark-400 hover:text-dark-200'
                                    : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        Unread
                        {unreadCount > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-primary-500 text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Mark All Read */}
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                                ${isDark
                                    ? 'text-dark-300 hover:text-white hover:bg-dark-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
                                }
                            `}
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* Notification List */}
            <div className="space-y-3">
                {filteredList.length > 0 ? (
                    filteredList.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                        />
                    ))
                ) : (
                    <div className={`
                        flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed
                        ${isDark ? 'border-dark-700 bg-dark-800/30' : 'border-gray-200 bg-gray-50/50'}
                    `}>
                        <div className={`
                            p-4 rounded-full mb-4
                            ${isDark ? 'bg-dark-800' : 'bg-white shadow-sm'}
                        `}>
                            <BellOff className={`w-8 h-8 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                        </div>
                        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            No notifications
                        </h3>
                        <p className={`mt-1 text-sm max-w-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            {filter === 'unread'
                                ? "You're all caught up! No unread messages."
                                : "You don't have any notifications yet."}
                        </p>
                        {!isPremium && (
                            <button
                                onClick={handleCheckMatches}
                                disabled={checkingMatches}
                                className={`
                                    mt-4 flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                                    ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                                    }
                                `}
                            >
                                {checkingMatches ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Check for Job Matches
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
