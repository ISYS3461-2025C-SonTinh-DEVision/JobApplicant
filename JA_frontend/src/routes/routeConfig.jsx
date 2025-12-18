/**
 * Route Configuration
 * Central routing configuration for the application
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

// Main Pages
import TestPage from '../pages/TestPage';

// Error Pages
import NotFound from '../pages/error/NotFound';

// Protected Route Components
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from './ProtectedRoute';

// Layout Components
import AppLayout from '../components/layout/AppLayout';

/**
 * Route definitions
 */
export const routes = [
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
  // Protected Routes (requires authentication)
  // =====================================
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <TestPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <TestPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // Job routes (placeholder for future implementation)
  {
    path: '/jobs',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">Job Search</h1>
            <p className="text-dark-400 mt-2">Coming soon...</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/jobs/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">Job Details</h1>
            <p className="text-dark-400 mt-2">Coming soon...</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // Profile routes
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-dark-400 mt-2">Coming soon...</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // Applications routes
  {
    path: '/applications',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">My Applications</h1>
            <p className="text-dark-400 mt-2">Coming soon...</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // Subscription routes
  {
    path: '/subscription',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">Subscription</h1>
            <p className="text-dark-400 mt-2">Coming soon...</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  // =====================================
  // Admin Routes
  // =====================================
  {
    path: '/admin/login',
    element: (
      <PublicOnlyRoute redirectTo="/admin">
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AppLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-dark-400 mt-2">Coming soon...</p>
          </div>
        </AppLayout>
      </AdminRoute>
    ),
  },

  // =====================================
  // Error Routes
  // =====================================
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

/**
 * Create router instance
 */
export const router = createBrowserRouter(routes);

export default router;

