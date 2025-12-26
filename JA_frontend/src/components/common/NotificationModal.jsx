/**
 * Notification Modal Component
 * 
 * Reusable modal for success/error/info notifications
 * Replaces browser alerts with beautiful UI
 * 
 * Uses: useHeadlessModal for state management
 * Architecture: A.3.a (Ultimo) - Headless UI pattern
 */

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useHeadlessModal } from '../headless';
import { useTheme } from '../../context/ThemeContext';

// Notification types with their icons and colors
const NOTIFICATION_TYPES = {
    success: {
        icon: CheckCircle,
        iconColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
    },
    error: {
        icon: XCircle,
        iconColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
    },
    warning: {
        icon: AlertCircle,
        iconColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
    },
};

/**
 * Notification Modal Component
 */
export default function NotificationModal({
    isOpen,
    onClose,
    type = 'info',
    title,
    message,
    autoClose = true,
    autoCloseDelay = 3000,
}) {
    const { isDark } = useTheme();
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
    const IconComponent = config.icon;

    // Auto close
    React.useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose?.();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
        relative w-full max-w-sm rounded-2xl p-6 shadow-2xl
        animate-scale-in border
        ${isDark
                    ? 'bg-dark-800 border-dark-700'
                    : 'bg-white border-gray-200'
                }
      `}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`
            absolute top-4 right-4 p-1 rounded-lg transition-colors
            ${isDark
                            ? 'text-dark-400 hover:text-white hover:bg-dark-700'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }
          `}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className={`
          w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
          ${config.bgColor} border ${config.borderColor}
        `}>
                    <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
                </div>

                {/* Title */}
                {title && (
                    <h3 className={`
            text-lg font-semibold text-center mb-2
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
                        {title}
                    </h3>
                )}

                {/* Message */}
                {message && (
                    <p className={`
            text-center
            ${isDark ? 'text-dark-300' : 'text-gray-600'}
          `}>
                        {message}
                    </p>
                )}

                {/* Action button */}
                <button
                    onClick={onClose}
                    className={`
            w-full mt-6 px-4 py-2.5 rounded-xl font-medium transition-colors
            ${type === 'success'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : type === 'error'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                        }
          `}
                >
                    OK
                </button>
            </div>
        </div>
    );
}

/**
 * Custom hook to use notification modal
 * Returns modal state and methods
 */
export function useNotificationModal() {
    const modal = useHeadlessModal();
    const [notification, setNotification] = React.useState({
        type: 'info',
        title: '',
        message: '',
    });

    const showNotification = React.useCallback((type, title, message) => {
        setNotification({ type, title, message });
        modal.open();
    }, [modal]);

    const showSuccess = React.useCallback((title, message) => {
        showNotification('success', title, message);
    }, [showNotification]);

    const showError = React.useCallback((title, message) => {
        showNotification('error', title, message);
    }, [showNotification]);

    const showWarning = React.useCallback((title, message) => {
        showNotification('warning', title, message);
    }, [showNotification]);

    const showInfo = React.useCallback((title, message) => {
        showNotification('info', title, message);
    }, [showNotification]);

    return {
        isOpen: modal.isOpen,
        close: modal.close,
        notification,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
}
