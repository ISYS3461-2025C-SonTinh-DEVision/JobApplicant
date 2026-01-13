/**
 * Authentication Context
 * Provides global authentication state and methods
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/AuthService';
import AccountDeactivatedModal from '../components/common/AccountDeactivatedModal';

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
  // Animation flags - block route redirects while animations play
  const [showLoginAnimation, setShowLoginAnimation] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  // Account deactivation state (real-time admin action)
  const [accountDeactivated, setAccountDeactivated] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');

  /**
   * Clear auth error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update user data (e.g., after avatar upload)
   */
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
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
          userId: response.userId,
          applicantId: response.applicantId,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          avatarUrl: response.avatarUrl || null, // Avatar URL for sidebar/navbar
          // SSO detection fields for Security Settings page (SRS 1.3.2)
          authProvider: response.authProvider || 'local',
          hasLocalPassword: response.hasLocalPassword !== false, // Default true for existing users
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

      // Trigger login animation
      setShowLoginAnimation(true);

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
   * Logout user with animation
   * Note: Auth state is cleared by GlobalAuthAnimation after animation completes
   */
  const logout = useCallback(async () => {
    // Only trigger animation - state will be cleared after animation completes
    // by GlobalAuthAnimation calling performLogout
    setShowLogoutAnimation(true);
  }, []);

  /**
   * Actually perform logout (called after animation completes)
   */
  const performLogout = useCallback(async () => {
    setStatus(AUTH_STATUS.LOADING);

    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      setError(null);
      setShowLogoutAnimation(false);
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
   * Login with Google ID Token (Google Identity Services)
   * This is the primary method for Google SSO using ID Token Flow (Ultimo requirement 1.3.1)
   * @param {string} idToken - Google ID token from GIS SDK
   */
  const loginWithGoogleIdToken = useCallback(async (idToken) => {
    setStatus(AUTH_STATUS.LOADING);
    setError(null);

    try {
      await authService.loginWithGoogleIdToken(idToken);
      await checkAuth();

      // Trigger login animation
      setShowLoginAnimation(true);

      return { success: true };
    } catch (err) {
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      const errorMessage = err.data?.message || err.message || 'Google login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [checkAuth]);

  /**
   * @deprecated Use loginWithGoogleIdToken with Google Identity Services instead
   * Initiate Google SSO (redirect-based, legacy)
   */
  const loginWithGoogle = useCallback(() => {
    console.warn('loginWithGoogle is deprecated. Use loginWithGoogleIdToken with Google Identity Services instead.');
    authService.initiateGoogleLogin();
  }, []);

  /**
   * @deprecated Use loginWithGoogleIdToken instead
   * Handle Google callback (authorization code flow, legacy)
   */
  const handleGoogleCallback = useCallback(async (code) => {
    console.warn('handleGoogleCallback is deprecated. Use loginWithGoogleIdToken instead.');
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

  // Listen for account deactivation events (from WebSocket via NotificationContext)
  useEffect(() => {
    const handleAccountDeactivated = (event) => {
      console.log('[AuthContext] Account deactivated by admin:', event.detail);
      setDeactivationReason(event.detail?.reason || 'Your account has been deactivated by an administrator.');
      setAccountDeactivated(true);
    };

    window.addEventListener('auth:account-deactivated', handleAccountDeactivated);
    return () => {
      window.removeEventListener('auth:account-deactivated', handleAccountDeactivated);
    };
  }, []);

  /**
   * Handle forced logout after account deactivation
   * Called when user clicks "Logout" in deactivation modal or countdown expires
   */
  const handleDeactivationLogout = useCallback(async () => {
    setAccountDeactivated(false);
    setDeactivationReason('');
    // Clear auth state and token
    await authService.logout().catch(() => { });
    setUser(null);
    setStatus(AUTH_STATUS.UNAUTHENTICATED);
  }, []);

  // Context value
  const value = {
    // State
    user,
    currentUser: user, // Alias for components that use currentUser
    status,
    error,
    isInitialized,
    isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
    isLoading: status === AUTH_STATUS.LOADING,

    // Login animation control
    showLoginAnimation,
    setShowLoginAnimation,

    // Logout animation control
    showLogoutAnimation,
    setShowLogoutAnimation,

    // Actions
    login,
    logout,
    performLogout, // Called by GlobalAuthAnimation after animation completes
    register,
    checkAuth,
    clearError,
    updateUser, // New: update user data (avatar, etc.)
    activateAccount,
    forgotPassword,
    resetPassword,
    loginWithGoogleIdToken, // Primary: Google SSO with ID Token (GIS)
    loginWithGoogle, // Deprecated: redirect-based flow
    handleGoogleCallback, // Deprecated: authorization code callback
    getCountries,
    // Account deactivation (admin action)
    accountDeactivated,
    deactivationReason,
    handleDeactivationLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Account Deactivated Modal - shows when admin deactivates user's account */}
      <AccountDeactivatedModal
        isOpen={accountDeactivated}
        reason={deactivationReason}
        onLogout={handleDeactivationLogout}
        countdownSeconds={15}
      />
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

