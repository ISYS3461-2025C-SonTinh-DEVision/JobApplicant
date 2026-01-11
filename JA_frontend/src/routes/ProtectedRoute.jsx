/**
 * Protected Route Component
 * Handles route protection based on authentication status
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AUTH_STATUS } from '../context/AuthContext';
import CatLoadingSpinner from '../components/common/CatLoadingSpinner';

/**
 * Loading screen component with cute cat animation
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <CatLoadingSpinner size="xl" message="Loading..." />
    </div>
  );
}

/**
 * Protected Route - Requires authentication
 */
export function ProtectedRoute({ children }) {
  const { status, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (!isInitialized || status === AUTH_STATUS.LOADING) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Public Only Route - Redirects authenticated users
 * Used for login/register pages
 */
export function PublicOnlyRoute({ children, redirectTo = '/' }) {
  const { status, isInitialized, showLoginAnimation } = useAuth();

  // Show loading while checking authentication
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Don't redirect while login animation is playing
  // Allow the animation component to handle navigation
  if (showLoginAnimation) {
    return children;
  }

  // Redirect to home if already authenticated
  if (status === AUTH_STATUS.AUTHENTICATED) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

/**
 * Admin Route - Requires admin role
 */
export function AdminRoute({ children }) {
  const { status, isInitialized, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (!isInitialized || status === AUTH_STATUS.LOADING) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check for admin role
  const isAdmin = user?.roles?.some(
    (role) => role.authority === 'ROLE_ADMIN' || role === 'ADMIN'
  );

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

