/**
 * Authentication Context
 * Provides global authentication state and methods
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/AuthService';

// Create context
const AuthContext = createContext(null);

// Auth states enum
export const AUTH_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
};

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(AUTH_STATUS.IDLE);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Clear auth error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check session on mount and token changes
   */
  const checkAuth = useCallback(async () => {
    setStatus(AUTH_STATUS.LOADING);
    setError(null);

    try {
      const response = await authService.checkSession();
      
      if (response?.authenticated) {
        setUser({
          username: response.username,
          roles: response.roles,
        });
        setStatus(AUTH_STATUS.AUTHENTICATED);
      } else {
        setUser(null);
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
      }
    } catch (err) {
      setUser(null);
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      // Don't set error for session check failures - it's expected when not logged in
    } finally {
      setIsInitialized(true);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials) => {
    setStatus(AUTH_STATUS.LOADING);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      // After successful login, check session to get user details
      await checkAuth();
      
      return { success: true, message: response.message };
    } catch (err) {
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      setError(err.message || 'Login failed');
      return { success: false, message: err.message || 'Login failed' };
    }
  }, [checkAuth]);

  /**
   * Register new user
   */
  const register = useCallback(async (userData) => {
    setStatus(AUTH_STATUS.LOADING);
    setError(null);

    try {
      const response = await authService.register(userData);
      setStatus(AUTH_STATUS.UNAUTHENTICATED); // User needs to verify email
      
      return {
        success: response.success,
        message: response.message,
        userId: response.userId,
        applicantId: response.applicantId,
      };
    } catch (err) {
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      const errorMessage = err.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setStatus(AUTH_STATUS.LOADING);

    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors, always clear local state
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      setError(null);
    }
  }, []);

  /**
   * Activate account
   */
  const activateAccount = useCallback(async (token) => {
    try {
      const response = await authService.activateAccount(token);
      return response;
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Account activation failed',
      };
    }
  }, []);

  /**
   * Request password reset
   */
  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Failed to send password reset email',
      };
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Failed to reset password',
      };
    }
  }, []);

  /**
   * Initiate Google SSO
   */
  const loginWithGoogle = useCallback(() => {
    authService.initiateGoogleLogin();
  }, []);

  /**
   * Handle Google callback
   */
  const handleGoogleCallback = useCallback(async (code) => {
    setStatus(AUTH_STATUS.LOADING);
    setError(null);

    try {
      await authService.handleGoogleCallback(code);
      await checkAuth();
      return { success: true };
    } catch (err) {
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      setError(err.message || 'Google login failed');
      return { success: false, message: err.message || 'Google login failed' };
    }
  }, [checkAuth]);

  /**
   * Get countries list for registration
   */
  const getCountries = useCallback(async () => {
    try {
      return await authService.getCountries();
    } catch (err) {
      console.error('Failed to fetch countries:', err);
      // Return default countries if API fails
      return [
        { value: 'VIETNAM', label: 'Vietnam', code: 'VN' },
        { value: 'SINGAPORE', label: 'Singapore', code: 'SG' },
      ];
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    // Check if there's a token, then verify session
    if (authService.isAuthenticated()) {
      checkAuth();
    } else {
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      setIsInitialized(true);
    }
  }, [checkAuth]);

  // Listen for unauthorized events (from httpUtil)
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Context value
  const value = {
    // State
    user,
    status,
    error,
    isInitialized,
    isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
    isLoading: status === AUTH_STATUS.LOADING,

    // Actions
    login,
    logout,
    register,
    checkAuth,
    clearError,
    activateAccount,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
    handleGoogleCallback,
    getCountries,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;

