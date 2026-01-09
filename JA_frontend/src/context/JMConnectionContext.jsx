/**
 * JM Connection Context
 * 
 * Tracks Job Manager API connection status and provides:
 * - Connection state (connected/disconnected)
 * - Toast notifications for status changes
 * - Logo color state (green=connected, red=disconnected)
 * 
 * @module JMConnectionContext
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const JMConnectionContext = createContext(null);

// Connection states
export const CONNECTION_STATUS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CHECKING: 'checking',
    UNKNOWN: 'unknown'
};

/**
 * JM Connection Provider
 */
export function JMConnectionProvider({ children }) {
    const [status, setStatus] = useState(CONNECTION_STATUS.UNKNOWN);
    const [toast, setToast] = useState(null);
    const toastTimeoutRef = useRef(null);
    const lastStatusRef = useRef(CONNECTION_STATUS.UNKNOWN);

    // Show toast notification
    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        // Clear existing timeout
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        setToast({ message, type, visible: true });

        // Auto-hide
        toastTimeoutRef.current = setTimeout(() => {
            setToast(prev => prev ? { ...prev, visible: false } : null);
            // Clear toast after animation
            setTimeout(() => setToast(null), 300);
        }, duration);
    }, []);

    // Hide toast manually
    const hideToast = useCallback(() => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        setToast(prev => prev ? { ...prev, visible: false } : null);
        setTimeout(() => setToast(null), 300);
    }, []);

    // Report successful JM API call
    const reportSuccess = useCallback(() => {
        const previousStatus = lastStatusRef.current;
        lastStatusRef.current = CONNECTION_STATUS.CONNECTED;
        setStatus(CONNECTION_STATUS.CONNECTED);

        // Show toast on status change
        if (previousStatus === CONNECTION_STATUS.DISCONNECTED) {
            // Restored from disconnected state
            showToast('✅ Job Manager connection restored!', 'success');
        } else if (previousStatus === CONNECTION_STATUS.UNKNOWN) {
            // First successful connection
            showToast('✅ Connected to Job Manager', 'success', 3000);
        }
    }, [showToast]);

    // Report failed JM API call
    const reportError = useCallback((errorMessage = 'Connection failed') => {
        const previousStatus = lastStatusRef.current;
        lastStatusRef.current = CONNECTION_STATUS.DISCONNECTED;
        setStatus(CONNECTION_STATUS.DISCONNECTED);

        // Show toast on status change (from connected/unknown to disconnected)
        if (previousStatus !== CONNECTION_STATUS.DISCONNECTED) {
            showToast(`⚠️ Job Manager: ${errorMessage}`, 'error', 5000);
        }
    }, [showToast]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    const value = {
        status,
        isConnected: status === CONNECTION_STATUS.CONNECTED,
        isDisconnected: status === CONNECTION_STATUS.DISCONNECTED,
        toast,
        hideToast,
        reportSuccess,
        reportError,
        showToast
    };

    return (
        <JMConnectionContext.Provider value={value}>
            {children}
        </JMConnectionContext.Provider>
    );
}

/**
 * Hook to use JM connection context
 */
export function useJMConnection() {
    const context = useContext(JMConnectionContext);
    if (!context) {
        throw new Error('useJMConnection must be used within JMConnectionProvider');
    }
    return context;
}

export default JMConnectionContext;
