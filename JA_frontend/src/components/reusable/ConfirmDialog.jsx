/**
 * Confirm Dialog Component
 * Custom modal for delete confirmations with smooth animations
 * Enhanced UI with beautiful gradients, shadows, and typography
 * Architecture: A.1.c Reusable Component
 */

import React from 'react';
import { AlertTriangle, X, Trash2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ConfirmDialog - A beautiful, animated confirmation dialog
 * @param {boolean} isOpen - Whether dialog is open
 * @param {function} onClose - Close handler
 * @param {function} onConfirm - Confirm action handler
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @param {string} variant - 'danger' | 'warning' | 'info'
 */
export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false
}) {
    const { isDark } = useTheme();

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: Trash2,
            iconBg: 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600',
            iconColor: 'text-white',
            buttonBg: 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-700',
            ring: 'ring-red-500/20',
            glow: 'shadow-red-500/25'
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
            iconColor: 'text-white',
            buttonBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600',
            ring: 'ring-amber-500/20',
            glow: 'shadow-amber-500/25'
        },
        info: {
            icon: AlertCircle,
            iconBg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
            iconColor: 'text-white',
            buttonBg: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700',
            ring: 'ring-blue-500/20',
            glow: 'shadow-blue-500/25'
        }
    };

    const styles = variantStyles[variant] || variantStyles.danger;
    const IconComponent = styles.icon;

    return (
        <>
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-opacity duration-300"
                onClick={onClose}
                style={{ animation: 'fadeIn 0.2s ease-out' }}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className={`
            relative w-full max-w-md pointer-events-auto
            transform transition-all duration-300
            ${isDark
                            ? 'bg-gradient-to-b from-dark-800 to-dark-900 border border-dark-600/50'
                            : 'bg-gradient-to-b from-white to-gray-50 border border-gray-200/80'
                        }
            rounded-3xl shadow-2xl ${styles.glow}
          `}
                    onClick={(e) => e.stopPropagation()}
                    style={{ animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                    {/* Decorative top gradient line */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-b-full ${styles.iconBg}`} />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={`
              absolute top-4 right-4 p-2 rounded-xl transition-all duration-200
              ${isDark
                                ? 'text-dark-400 hover:text-white hover:bg-dark-700'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
            `}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="p-8 text-center">
                        {/* Icon with animated ring */}
                        <div className="relative inline-flex mb-6">
                            <div className={`
                absolute inset-0 rounded-2xl ${styles.iconBg} opacity-20 blur-xl
                animate-pulse
              `} />
                            <div className={`
                relative w-20 h-20 rounded-2xl flex items-center justify-center
                ${styles.iconBg} shadow-xl ring-8 ${styles.ring}
                transform transition-transform hover:scale-105
              `}>
                                <IconComponent className={`w-10 h-10 ${styles.iconColor}`} />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className={`
              text-2xl font-bold mb-3 tracking-tight
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
                            {title}
                        </h3>

                        {/* Message */}
                        <p className={`
              text-base leading-relaxed mb-8 max-w-sm mx-auto
              ${isDark ? 'text-dark-300' : 'text-gray-600'}
            `}>
                            {message}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className={`
                  flex-1 px-6 py-3.5 rounded-2xl font-semibold text-base
                  transition-all duration-200 transform
                  ${isDark
                                        ? 'bg-dark-700 text-dark-200 hover:bg-dark-600 hover:text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                                    }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                `}
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`
                  flex-1 px-6 py-3.5 rounded-2xl font-semibold text-base text-white
                  transition-all duration-200 transform
                  ${styles.buttonBg}
                  ${loading
                                        ? 'opacity-70 cursor-not-allowed'
                                        : 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                    }
                `}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Deleting...</span>
                                    </span>
                                ) : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Keyframes for animations */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
        </>
    );
}
