/**
 * Toast Notification Component
 * 
 * Animated toast notifications for real-time feedback.
 * Uses Headless UI pattern with useHeadlessNotification hook.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, XCircle, AlertCircle, Info, X,
    ExternalLink, Briefcase, Bell
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { NOTIFICATION_TYPES } from '../../services/NotificationService';

/**
 * Get toast configuration based on type
 */
function getToastConfig(type, isDark) {
    const configs = {
        success: {
            icon: CheckCircle,
            bgColor: isDark ? 'from-green-500/20 to-green-600/10' : 'from-green-50 to-green-100',
            borderColor: isDark ? 'border-green-500/30' : 'border-green-200',
            iconColor: isDark ? 'text-green-400' : 'text-green-600',
            iconBg: isDark ? 'bg-green-500/20' : 'bg-green-100',
        },
        error: {
            icon: XCircle,
            bgColor: isDark ? 'from-red-500/20 to-red-600/10' : 'from-red-50 to-red-100',
            borderColor: isDark ? 'border-red-500/30' : 'border-red-200',
            iconColor: isDark ? 'text-red-400' : 'text-red-600',
            iconBg: isDark ? 'bg-red-500/20' : 'bg-red-100',
        },
        warning: {
            icon: AlertCircle,
            bgColor: isDark ? 'from-amber-500/20 to-amber-600/10' : 'from-amber-50 to-amber-100',
            borderColor: isDark ? 'border-amber-500/30' : 'border-amber-200',
            iconColor: isDark ? 'text-amber-400' : 'text-amber-600',
            iconBg: isDark ? 'bg-amber-500/20' : 'bg-amber-100',
        },
        info: {
            icon: Info,
            bgColor: isDark ? 'from-blue-500/20 to-blue-600/10' : 'from-blue-50 to-blue-100',
            borderColor: isDark ? 'border-blue-500/30' : 'border-blue-200',
            iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
            iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
        },
        [NOTIFICATION_TYPES.JOB_MATCH]: {
            icon: Briefcase,
            bgColor: isDark ? 'from-primary-500/20 to-primary-600/10' : 'from-primary-50 to-primary-100',
            borderColor: isDark ? 'border-primary-500/30' : 'border-primary-200',
            iconColor: isDark ? 'text-primary-400' : 'text-primary-600',
            iconBg: isDark ? 'bg-primary-500/20' : 'bg-primary-100',
        },
        [NOTIFICATION_TYPES.APPLICATION_UPDATE]: {
            icon: Bell,
            bgColor: isDark ? 'from-accent-500/20 to-accent-600/10' : 'from-accent-50 to-accent-100',
            borderColor: isDark ? 'border-accent-500/30' : 'border-accent-200',
            iconColor: isDark ? 'text-accent-400' : 'text-accent-600',
            iconBg: isDark ? 'bg-accent-500/20' : 'bg-accent-100',
        },
    };

    return configs[type] || configs.info;
}

/**
 * Single Toast Component
 */
function Toast({ toast, onDismiss }) {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    const config = getToastConfig(toast.type, isDark);
    const Icon = config.icon;

    // Progress bar animation
    useEffect(() => {
        if (toast.duration <= 0) return;

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [toast.duration]);

    // Handle dismiss with exit animation
    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
    };

    // Handle action click
    const handleAction = () => {
        if (toast.action?.href) {
            navigate(toast.action.href);
        } else if (toast.action?.onClick) {
            toast.action.onClick();
        }
        handleDismiss();
    };

    return (
        <div
            className={`
        relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}
        bg-gradient-to-r ${config.bgColor} ${config.borderColor}
      `}
        >
            <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {toast.title}
                        </p>
                    )}
                    {toast.message && (
                        <p className={`text-sm mt-0.5 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            {toast.message}
                        </p>
                    )}

                    {/* Action Button */}
                    {toast.action && (
                        <button
                            onClick={handleAction}
                            className={`
                mt-2 inline-flex items-center gap-1 text-sm font-medium transition-colors
                ${config.iconColor} hover:underline
              `}
                        >
                            {toast.action.label}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className={`
            p-1.5 rounded-lg transition-colors flex-shrink-0
            ${isDark
                            ? 'text-dark-400 hover:text-white hover:bg-dark-600/50'
                            : 'text-gray-400 hover:text-gray-900 hover:bg-white/50'
                        }
          `}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Bar */}
            {toast.duration > 0 && (
                <div className={`h-1 ${isDark ? 'bg-dark-700/50' : 'bg-white/30'}`}>
                    <div
                        className={`h-full transition-all duration-100 ease-linear ${config.iconColor.replace('text-', 'bg-')}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}

/**
 * Toast Container Component
 * Renders all active toasts
 */
export default function ToastContainer() {
    const { toasts, dismissToast } = useNotifications();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto"
                    style={{
                        animationDelay: `${index * 50}ms`,
                    }}
                >
                    <Toast toast={toast} onDismiss={dismissToast} />
                </div>
            ))}
        </div>
    );
}

export { Toast, getToastConfig };
