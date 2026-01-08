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
    Bell, CheckCheck, X, ExternalLink
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationItem from '../../components/notifications/NotificationItem';

/**
 * Notification Bell Component
 */
export default function NotificationBell() {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

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
                        {loading && notifications.length === 0 ? (
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
                    <div className={`p-3 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/dashboard/notifications');
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
                </div>
            )}
        </div>
    );
}
