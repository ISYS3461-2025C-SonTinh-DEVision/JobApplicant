/**
 * Reusable Toast/Notification Component
 * 
 * Styled notification component for use with HeadlessNotification hook.
 * Supports: multiple types, auto-dismiss, actions.
 * 
 * Architecture: A.2.a (Medium Frontend) - Reusable UI Component
 */

import React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

/**
 * Toast Icons by type
 */
const ToastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * Single Toast Component
 */
export function Toast({
  type = 'info',
  title,
  message,
  onDismiss,
  dismissible = true,
  action,
  variant = 'dark',
}) {
  const Icon = ToastIcons[type] || Info;

  const themes = {
    dark: {
      success: 'bg-green-500/10 border-green-500/20 text-green-400',
      error: 'bg-red-500/10 border-red-500/20 text-red-400',
      warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      container: 'border rounded-xl p-4 shadow-lg backdrop-blur-sm',
      title: 'font-semibold',
      message: 'opacity-90',
      closeButton: 'opacity-60 hover:opacity-100',
      actionButton: 'text-xs font-medium underline-offset-2 hover:underline',
    },
    light: {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      container: 'border rounded-lg p-4 shadow-md',
      title: 'font-semibold',
      message: 'opacity-80',
      closeButton: 'opacity-50 hover:opacity-100',
      actionButton: 'text-xs font-medium underline-offset-2 hover:underline',
    },
  };

  const theme = themes[variant] || themes.dark;
  const typeStyles = theme[type] || theme.info;

  return (
    <div className={`${theme.container} ${typeStyles} animate-slide-up`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`${theme.title} text-sm`}>{title}</p>
          )}
          {message && (
            <p className={`${theme.message} text-sm ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={`${theme.actionButton} mt-2`}
            >
              {action.label}
            </button>
          )}
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${theme.closeButton} transition-opacity p-1 -m-1`}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Toast Container Component
 * 
 * Manages the positioning and stacking of multiple toasts.
 */
export function ToastContainer({
  notifications = [],
  onDismiss,
  position = 'top-right',
  variant = 'dark',
}) {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  if (notifications.length === 0) return null;

  return (
    <div
      className={`fixed ${positions[position]} z-50 w-full max-w-sm space-y-3 pointer-events-none`}
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast
            {...notification}
            onDismiss={notification.dismissible ? () => onDismiss(notification.id) : undefined}
            variant={variant}
          />
        </div>
      ))}
    </div>
  );
}

export default Toast;

