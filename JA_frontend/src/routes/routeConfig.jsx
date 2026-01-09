/**
 * Route Configuration
 * Central routing configuration for the application
 * 
 * Architecture: React Router with nested routes
 * - Public routes (login, register)
 * - Protected routes (dashboard)
 * - Admin routes
 * - Job routes
 */

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, Search, MapPin, Briefcase,
  Crown, TrendingUp, Bell, Shield, User
} from 'lucide-react';

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
import SecuritySettingsPage from '../pages/dashboard/SecuritySettingsPage';
import MyApplicationsPage from '../pages/dashboard/MyApplicationsPage';
import ApplicationDetailPage from '../pages/dashboard/ApplicationDetailPage';
import JobListPage from '../pages/job/JobListPage';
import JobDetailPage from '../pages/job/JobDetailPage';

// Subscription Pages
import SubscriptionPage from '../pages/subscription/SubscriptionPage';
import PaymentPage from '../pages/subscription/PaymentPage';
import SearchProfilePage from '../pages/subscription/SearchProfilePage';
import SearchProfileSidebar from '../pages/dashboard/SearchProfileSidebar';
import NotificationsPage from '../pages/dashboard/NotificationsPage';

// Settings Page
import SettingsPage from '../pages/dashboard/settings/SettingsPage';

// Admin Pages
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboardPage from '../pages/admin/DashboardPage';
import ApplicantListPage from '../pages/admin/ApplicantListPage';
import CompanyListPage from '../pages/admin/CompanyListPage';
import JobPostListPage from '../pages/admin/JobPostListPage';

// Placeholder Pages
import ComingSoon from '../pages/placeholder/ComingSoon';

// Legal Pages
import CookiePolicyPage from '../pages/legal/CookiePolicyPage';

// Error Pages
import NotFound from '../pages/error/NotFound';

// Protected Route Components
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { AdminProtectedRoute, AdminPublicRoute } from './AdminProtectedRoute';

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
  {
    path: '/activate',
    element: <VerifyEmailPage />,
  },

  // =====================================
  // Public Job Routes
  // =====================================
  {
    path: '/jobs',
    element: <JobListPage />,
  },
  {
    path: '/jobs/:id',
    element: <JobDetailPage />,
  },
  // Cookie Policy Page (accessible from cookie banner)
  {
    path: '/cookie-policy',
    element: <CookiePolicyPage />,
  },

  // =====================================
  // Admin Routes
  // =====================================
  {
    path: '/admin/login',
    element: (
      <AdminPublicRoute>
        <AdminLoginPage />
      </AdminPublicRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'applicants',
        element: <ApplicantListPage />,
      },
      {
        path: 'companies',
        element: <CompanyListPage />,
      },
      {
        path: 'job-posts',
        element: <JobPostListPage />,
      },
    ],
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
        path: 'security',
        element: <SecuritySettingsPage />,
      },
      {
        path: 'applications',
        element: <MyApplicationsPage />,
      },
      {
        path: 'applications/:applicationId',
        element: <ApplicationDetailPage />,
      },
      {
        path: 'jobs',
        element: <JobListPage />,
      },
      {
        path: 'subscription',
        element: <SubscriptionPage />,
      },
      {
        path: 'subscription/payment',
        element: <PaymentPage />,
      },
      {
        path: 'subscription/search-profile',
        element: <SearchProfilePage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'search-profile',
        element: <SearchProfileSidebar />,
      },
      {
        path: 'analytics',
        element: (
          <ComingSoon
            featureName="Analytics"
            description="Get insights into your job search performance. Track profile views and application success."
            features={[
              { icon: TrendingUp, title: 'Profile Views', description: 'See how many employers viewed your profile' },
              { icon: FileText, title: 'Application Stats', description: 'Track your application success rate' },
              { icon: Search, title: 'Search Trends', description: 'Discover trending skills and job titles' }
            ]}
          />
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
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
  // 404 Not Found
  // =====================================
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
