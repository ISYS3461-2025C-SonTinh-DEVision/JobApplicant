import React, { useState } from 'react';
import { CheckCheck, BellOff } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationItem from '../../components/notifications/NotificationItem';

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loading,
        simulateNotification
    } = useNotifications();
    const { isDark } = useTheme();
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'

    const filteredList = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;



    if (loading && notifications.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in relative">
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

                <div className="flex items-center gap-3">
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
                </div>
            </div>

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

            {/* List */}
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
                        <p className={`mt-1 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            {filter === 'unread'
                                ? "You're all caught up! No unread messages."
                                : "You don't have any notifications yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
