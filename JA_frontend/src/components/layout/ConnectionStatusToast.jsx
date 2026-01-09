/**
 * Connection Status Toast Component
 * 
 * Displays toast notifications for JM connection status changes.
 * Slides down from top center with smooth animation.
 */

import React from 'react';
import { CheckCircle, AlertTriangle, X, Wifi, WifiOff } from 'lucide-react';
import { useJMConnection } from '../../context/JMConnectionContext';

export default function ConnectionStatusToast() {
    const { toast, hideToast } = useJMConnection();

    if (!toast) return null;

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    container: 'bg-emerald-50 border-emerald-200 shadow-emerald-100/50',
                    containerDark: 'bg-emerald-900/90 border-emerald-700',
                    icon: 'text-emerald-500',
                    text: 'text-emerald-800',
                    textDark: 'text-emerald-100',
                    Icon: CheckCircle,
                    StatusIcon: Wifi
                };
            case 'error':
                return {
                    container: 'bg-red-50 border-red-200 shadow-red-100/50',
                    containerDark: 'bg-red-900/90 border-red-700',
                    icon: 'text-red-500',
                    text: 'text-red-800',
                    textDark: 'text-red-100',
                    Icon: AlertTriangle,
                    StatusIcon: WifiOff
                };
            default:
                return {
                    container: 'bg-blue-50 border-blue-200 shadow-blue-100/50',
                    containerDark: 'bg-blue-900/90 border-blue-700',
                    icon: 'text-blue-500',
                    text: 'text-blue-800',
                    textDark: 'text-blue-100',
                    Icon: Wifi,
                    StatusIcon: Wifi
                };
        }
    };

    const styles = getToastStyles();
    const { Icon, StatusIcon } = styles;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4 pt-4">
            <div
                className={`
                    pointer-events-auto
                    flex items-center gap-3 px-4 py-3 rounded-xl border
                    shadow-lg backdrop-blur-sm
                    transform transition-all duration-300 ease-out
                    ${toast.visible
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-full opacity-0'
                    }
                    dark:${styles.containerDark} ${styles.container}
                `}
                style={{ maxWidth: '420px' }}
            >
                {/* Status Icon with pulse animation for error */}
                <div className={`flex-shrink-0 ${styles.icon} ${toast.type === 'error' ? 'animate-pulse' : ''}`}>
                    <StatusIcon className="w-5 h-5" />
                </div>

                {/* Message */}
                <p className={`flex-1 text-sm font-medium ${styles.text} dark:${styles.textDark}`}>
                    {toast.message}
                </p>

                {/* Close button */}
                <button
                    onClick={hideToast}
                    className={`
                        flex-shrink-0 p-1 rounded-lg transition-colors
                        hover:bg-black/10 dark:hover:bg-white/10
                        ${styles.text} dark:${styles.textDark}
                    `}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
