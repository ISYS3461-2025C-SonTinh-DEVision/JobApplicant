/**
 * Admin Authentication Context
 * Provides separate authentication state for admin users
 * 
 * Architecture: Separate from regular user AuthContext for admin isolation
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AdminService from '../services/AdminService';

// Create context
const AdminAuthContext = createContext(null);

// Admin auth states
export const ADMIN_AUTH_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
};

// Hardcoded admin credentials for testing (Requirement 6.1.1)
const ADMIN_CREDENTIALS = {
    email: 'admin@devision.com',
    password: 'Admin@123',
};

/**
 * Admin Authentication Provider
 */
export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [status, setStatus] = useState(ADMIN_AUTH_STATUS.IDLE);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Check admin session on mount
     */
    const checkAdminSession = useCallback(async () => {
        setStatus(ADMIN_AUTH_STATUS.LOADING);

        try {
            // Check localStorage for admin session
            const storedAdmin = localStorage.getItem('admin_session');

            if (storedAdmin) {
                const adminData = JSON.parse(storedAdmin);
                // Validate session hasn't expired (24 hour expiry)
                if (adminData.expiresAt && Date.now() < adminData.expiresAt) {
                    setAdmin(adminData);
                    setStatus(ADMIN_AUTH_STATUS.AUTHENTICATED);
                } else {
                    // Session expired
                    localStorage.removeItem('admin_session');
                    setAdmin(null);
                    setStatus(ADMIN_AUTH_STATUS.UNAUTHENTICATED);
                }
            } else {
                setStatus(ADMIN_AUTH_STATUS.UNAUTHENTICATED);
            }
        } catch (err) {
            console.error('Error checking admin session:', err);
            setAdmin(null);
            setStatus(ADMIN_AUTH_STATUS.UNAUTHENTICATED);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    /**
     * Admin login
     */
    const adminLogin = useCallback(async (credentials) => {
        setStatus(ADMIN_AUTH_STATUS.LOADING);
        setError(null);

        try {
            // First, try hardcoded credentials for development
            if (
                credentials.email === ADMIN_CREDENTIALS.email &&
                credentials.password === ADMIN_CREDENTIALS.password
            ) {
                const adminData = {
                    id: 'admin-001',
                    email: credentials.email,
                    name: 'System Administrator',
                    role: 'ADMIN',
                    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
                };

                // Store in localStorage
                localStorage.setItem('admin_session', JSON.stringify(adminData));
                setAdmin(adminData);
                setStatus(ADMIN_AUTH_STATUS.AUTHENTICATED);

                return { success: true, message: 'Admin login successful' };
            }

            // If not hardcoded, try API login
            try {
                const response = await AdminService.login(credentials);

                if (response?.success) {
                    const adminData = {
                        id: response.adminId || 'admin-api',
                        email: credentials.email,
                        name: response.name || 'Administrator',
                        role: 'ADMIN',
                        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                    };

                    localStorage.setItem('admin_session', JSON.stringify(adminData));
                    setAdmin(adminData);
                    setStatus(ADMIN_AUTH_STATUS.AUTHENTICATED);

                    return { success: true, message: 'Admin login successful' };
                }
            } catch (apiError) {
                console.warn('API admin login failed, using local validation:', apiError);
            }

            // Invalid credentials
            setStatus(ADMIN_AUTH_STATUS.UNAUTHENTICATED);
            setError('Invalid admin credentials');
            return { success: false, message: 'Invalid admin credentials' };

        } catch (err) {
            setStatus(ADMIN_AUTH_STATUS.UNAUTHENTICATED);
            setError(err.message || 'Admin login failed');
            return { success: false, message: err.message || 'Admin login failed' };
        }
    }, []);

    /**
     * Admin logout
     */
    const adminLogout = useCallback(async () => {
        try {
            // Try API logout
            await AdminService.logout();
        } catch (err) {
            console.warn('API logout failed:', err);
        } finally {
            // Always clear local session
            localStorage.removeItem('admin_session');
            setAdmin(null);
            setStatus(ADMIN_AUTH_STATUS.UNAUTHENTICATED);
            setError(null);
        }
    }, []);

    // Initialize on mount
    useEffect(() => {
        checkAdminSession();
    }, [checkAdminSession]);

    // Context value
    const value = {
        // State
        admin,
        status,
        error,
        isInitialized,
        isAuthenticated: status === ADMIN_AUTH_STATUS.AUTHENTICATED,
        isLoading: status === ADMIN_AUTH_STATUS.LOADING,

        // Actions
        adminLogin,
        adminLogout,
        checkAdminSession,
        clearError,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

/**
 * Hook to use admin auth context
 */
export function useAdminAuth() {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }

    return context;
}

export default AdminAuthContext;
