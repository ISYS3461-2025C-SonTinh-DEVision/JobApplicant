/**
 * Notifications Page
 * 
 * Display and manage all notifications for the user.
 * Features:
 * - Premium users: Real-time WebSocket connection status
 * - Regular users: "Check for New Matches" button for manual checking
 * - All users: View, read, delete notifications
 * - Infinite scroll / lazy loading (Requirement 4.2.4)
 * - Headless UI patterns (Requirement A.3.a)
 * 
 * Architecture: A.3.a (Ultimo) - Uses Headless UI patterns
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCheck, BellOff, RefreshCw, Wifi, WifiOff, Crown,
    Loader2, Target, ArrowRight, Filter, ChevronDown, Sparkles,
    Bell, Trash2, Settings, MoreVertical
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationItem from '../../components/notifications/NotificationItem';
import useHeadlessPagination from '../../components/headless/HeadlessPagination';

// Constants
const ITEMS_PER_PAGE = 10;
const NOTIFICATION_FILTERS = [
    { id: 'all', label: 'All Notifications', icon: Bell },
    { id: 'unread', label: 'Unread Only', icon: Sparkles },
    { id: 'JOB_MATCH', label: 'Job Matches', icon: Target },
];

/**
 * Connection Status Badge Component
 */
const ConnectionStatusBadge = ({ isConnected, isDark }) => {
    if (isConnected) {
        return (
            <span className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-300
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
            transition-all duration-300
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
const PremiumBanner = ({ isPremium, isConnected, onCheckMatches, checkingMatches, onSimulate, simulatingJob, isDark }) => {
    const navigate = useNavigate();

    if (isPremium) {
        return (
            <div className={`
                p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                transition-all duration-300
                ${isDark
                    ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-500/30'
                    : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200'
                }
            `}>
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}
                    `}>
                        <Crown className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    </div>
                    <div>
                        <p className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                            Premium Member
                        </p>
                        <p className={`text-sm ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                            Real-time job match notifications enabled
                        </p>
                    </div>
                </div>
                <ConnectionStatusBadge isConnected={isConnected} isDark={isDark} />
            </div>
        );
    }

    return (
        <div className={`
            p-4 sm:p-5 rounded-2xl border transition-all duration-300
            ${isDark ? 'bg-dark-800/50 border-dark-600' : 'bg-white border-gray-200 shadow-sm'}
        `}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        ${isDark ? 'bg-primary-500/20' : 'bg-primary-100'}
                    `}>
                        <Target className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                    </div>
                    <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Manual Matching Mode
                        </p>
                        <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            Click buttons to check for new job matches
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onCheckMatches}
                        disabled={checkingMatches}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 transform hover:scale-[1.02]
                            ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
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
                                Check Matches
                            </>
                        )}
                    </button>
                    <button
                        onClick={onSimulate}
                        disabled={simulatingJob}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200
                            ${isDark
                                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {simulatingJob ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Simulating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Simulate Job
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/subscription')}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 border
                            ${isDark
                                ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                : 'border-amber-300 text-amber-600 hover:bg-amber-50'
                            }
                        `}
                    >
                        <Crown className="w-4 h-4" />
                        Upgrade
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Filter Tabs Component
 */
const FilterTabs = ({ activeFilter, onFilterChange, unreadCount, isDark }) => {
    return (
        <div className={`
            flex flex-wrap gap-2 p-1 rounded-xl
            ${isDark ? 'bg-dark-800/50' : 'bg-gray-100'}
        `}>
            {NOTIFICATION_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;
                const showBadge = filter.id === 'unread' && unreadCount > 0;

                return (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`
                            relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                            transition-all duration-200
                            ${isActive
                                ? isDark
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white text-primary-600 shadow-md'
                                : isDark
                                    ? 'text-dark-300 hover:text-white hover:bg-dark-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }
                        `}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{filter.label}</span>
                        {showBadge && (
                            <span className={`
                                absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center
                                text-xs font-bold rounded-full
                                ${isDark ? 'bg-red-500 text-white' : 'bg-red-500 text-white'}
                            `}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

/**
 * Pagination Controls using Headless Pattern
 */
const PaginationControls = ({ pagination, isDark }) => {
    const {
        page,
        totalPages,
        canGoNext,
        canGoPrev,
        nextPage,
        prevPage,
        startItem,
        endItem,
        totalItems,
        getPageNumbers
    } = pagination;

    const pageNumbers = getPageNumbers(5);

    if (totalPages <= 1) return null;

    return (
        <div className={`
            flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border
            ${isDark ? 'bg-dark-800/50 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
        `}>
            {/* Item count */}
            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{totalItems}</span> notifications
            </p>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                    onClick={prevPage}
                    disabled={!canGoPrev}
                    className={`
                        p-2 rounded-lg transition-all duration-200
                        ${canGoPrev
                            ? isDark
                                ? 'hover:bg-dark-700 text-dark-300 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            : isDark
                                ? 'text-dark-600 cursor-not-allowed'
                                : 'text-gray-300 cursor-not-allowed'
                        }
                    `}
                >
                    <ChevronDown className="w-5 h-5 rotate-90" />
                </button>

                {/* First page */}
                {pageNumbers.showFirstPage && (
                    <>
                        <button
                            onClick={() => pagination.goToPage(1)}
                            className={`
                                w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                                ${isDark
                                    ? 'hover:bg-dark-700 text-dark-300'
                                    : 'hover:bg-gray-100 text-gray-600'
                                }
                            `}
                        >
                            1
                        </button>
                        {pageNumbers.showFirstEllipsis && (
                            <span className={`px-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>...</span>
                        )}
                    </>
                )}

                {/* Page numbers */}
                {pageNumbers.pages.map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => pagination.goToPage(pageNum)}
                        className={`
                            w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                            ${pageNum === page
                                ? isDark
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                                : isDark
                                    ? 'hover:bg-dark-700 text-dark-300'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }
                        `}
                    >
                        {pageNum}
                    </button>
                ))}

                {/* Last page */}
                {pageNumbers.showLastPage && (
                    <>
                        {pageNumbers.showLastEllipsis && (
                            <span className={`px-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>...</span>
                        )}
                        <button
                            onClick={() => pagination.goToPage(totalPages)}
                            className={`
                                w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                                ${isDark
                                    ? 'hover:bg-dark-700 text-dark-300'
                                    : 'hover:bg-gray-100 text-gray-600'
                                }
                            `}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next */}
                <button
                    onClick={nextPage}
                    disabled={!canGoNext}
                    className={`
                        p-2 rounded-lg transition-all duration-200
                        ${canGoNext
                            ? isDark
                                ? 'hover:bg-dark-700 text-dark-300 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            : isDark
                                ? 'text-dark-600 cursor-not-allowed'
                                : 'text-gray-300 cursor-not-allowed'
                        }
                    `}
                >
                    <ChevronDown className="w-5 h-5 -rotate-90" />
                </button>
            </div>
        </div>
    );
};

/**
 * Empty State Component
 */
const EmptyState = ({ filter, onCheckMatches, checkingMatches, isPremium, isDark }) => {
    const navigate = useNavigate();

    const messages = {
        all: {
            title: 'No notifications',
            description: "You don't have any notifications yet.",
        },
        unread: {
            title: "You're all caught up!",
            description: 'No unread notifications.',
        },
        JOB_MATCH: {
            title: 'No job matches',
            description: 'No job match notifications found.',
        },
    };

    const message = messages[filter] || messages.all;

    return (
        <div className={`
            flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed
            transition-all duration-300
            ${isDark ? 'border-dark-700 bg-dark-800/30' : 'border-gray-200 bg-gray-50/50'}
        `}>
            <div className={`
                p-4 rounded-full mb-4 animate-pulse
                ${isDark ? 'bg-dark-800' : 'bg-white shadow-sm'}
            `}>
                <BellOff className={`w-8 h-8 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {message.title}
            </h3>
            <p className={`mt-2 text-sm max-w-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                {message.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
                {!isPremium && (
                    <button
                        onClick={onCheckMatches}
                        disabled={checkingMatches}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                            ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
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
                <button
                    onClick={() => navigate('/dashboard/search-profile')}
                    className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 border
                        ${isDark
                            ? 'border-dark-600 text-dark-300 hover:bg-dark-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                    `}
                >
                    <Settings className="w-4 h-4" />
                    Update Preferences
                </button>
            </div>
        </div>
    );
};

/**
 * Main Notifications Page Component
 */
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
        loadNotifications,
        isPremium,
        isConnected,
    } = useNotifications();
    const { isDark } = useTheme();

    // Local state
    const [filter, setFilter] = useState('all');
    const [simulatingJob, setSimulatingJob] = useState(false);

    // Filter notifications
    const filteredNotifications = React.useMemo(() => {
        if (filter === 'all') return notifications;
        if (filter === 'unread') return notifications.filter(n => !n.read);
        return notifications.filter(n => n.type === filter);
    }, [notifications, filter]);

    // Use Headless Pagination
    const pagination = useHeadlessPagination({
        data: filteredNotifications,
        initialPageSize: ITEMS_PER_PAGE,
    });

    // Handle check for matches
    const handleCheckMatches = async () => {
        try {
            await checkForJobMatches();
        } catch (err) {
            console.error('Failed to check for matches:', err);
        }
    };

    // Handle simulate job match
    const handleSimulateJob = async () => {
        try {
            setSimulatingJob(true);
            const { default: notificationService } = await import('../../services/NotificationService');
            const result = await notificationService.simulateJobMatch();
            if (result.success) {
                console.log('Successfully simulated job match:', result.data);
                await loadNotifications();
            }
        } catch (err) {
            console.error('Failed to simulate job match:', err);
        } finally {
            setSimulatingJob(false);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    // Loading state
    if (loading && notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                    <div className={`
                        w-16 h-16 rounded-full border-4 border-t-transparent animate-spin
                        ${isDark ? 'border-primary-500' : 'border-primary-600'}
                    `} />
                </div>
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    Loading notifications...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                    </h1>
                    <p className={`mt-1 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                            : 'All caught up!'
                        }
                    </p>
                </div>

                {/* Header Actions */}
                {filteredNotifications.length > 0 && (
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                                    transition-all duration-200
                                    ${isDark
                                        ? 'bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }
                                `}
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">Mark all read</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Premium Banner */}
            <PremiumBanner
                isPremium={isPremium}
                isConnected={isConnected}
                onCheckMatches={handleCheckMatches}
                checkingMatches={checkingMatches}
                onSimulate={handleSimulateJob}
                simulatingJob={simulatingJob}
                isDark={isDark}
            />

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <FilterTabs
                    activeFilter={filter}
                    onFilterChange={setFilter}
                    unreadCount={unreadCount}
                    isDark={isDark}
                />

                {/* Results count */}
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Notification List with Pagination */}
            <div className="space-y-4">
                {pagination.paginatedData && pagination.paginatedData.length > 0 ? (
                    <>
                        {/* Notifications List */}
                        <div className="space-y-3">
                            {pagination.paginatedData.map((notification, index) => (
                                <div
                                    key={notification.id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <NotificationItem
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                        onDelete={deleteNotification}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <PaginationControls pagination={pagination} isDark={isDark} />
                    </>
                ) : (
                    <EmptyState
                        filter={filter}
                        onCheckMatches={handleCheckMatches}
                        checkingMatches={checkingMatches}
                        isPremium={isPremium}
                        isDark={isDark}
                    />
                )}
            </div>
        </div>
    );
}
