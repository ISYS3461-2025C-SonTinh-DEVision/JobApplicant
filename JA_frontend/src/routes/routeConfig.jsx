/**
 * Route Configuration
 * Central routing configuration for the application
 * 
 * Architecture: React Router with nested routes
 * - Public routes (login, register)
 * - Protected routes (dashboard)
 * - Admin routes
 */

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import SSOCallbackPage from '../pages/auth/SSOCallbackPage';

// Dashboard Pages
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardHome from '../pages/dashboard/DashboardHome';
import ProfileDashboard from '../pages/dashboard/ProfileDashboard';
import EditProfile from '../pages/dashboard/EditProfile';

// Main Pages
import TestPage from '../pages/TestPage';

// Error Pages
import NotFound from '../pages/error/NotFound';

// Protected Route Components
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

/**
 * Router configuration
 */
const router = createBrowserRouter([
  // =====================================
  // Public Auth Routes (redirect if logged in)
  // =====================================
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },

  // =====================================
  // Public Auth Routes (accessible anytime)
  // =====================================
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/auth/callback/google',
    element: <SSOCallbackPage />,
  },
  {
    path: '/auth/activate',
    element: <VerifyEmailPage />,
  },

  // =====================================
  // Protected Dashboard Routes
  // =====================================
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: 'profile',
        element: <ProfileDashboard />,
      },
      {
        path: 'profile/edit',
        element: <EditProfile />,
      },
      {
        path: 'applications',
        element: <TestPage />, // Placeholder - will be implemented later
      },
      {
        path: 'jobs',
        element: <TestPage />, // Placeholder - needs Job Manager API
      },
      {
        path: 'subscription',
        element: <TestPage />, // Placeholder - will be implemented later
      },
      {
        path: 'analytics',
        element: <TestPage />, // Placeholder - will be implemented later
      },
      {
        path: 'settings',
        element: <TestPage />, // Placeholder - will be implemented later
      },
    ],
  },

  // =====================================
  // Root Redirects
  // =====================================
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/home',
    element: <Navigate to="/dashboard" replace />,
  },

  // =====================================
  // Test/Development Routes
  // =====================================
  {
    path: '/test',
    element: <TestPage />,
  },

  // =====================================
  // 404 Not Found
  // =====================================
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
