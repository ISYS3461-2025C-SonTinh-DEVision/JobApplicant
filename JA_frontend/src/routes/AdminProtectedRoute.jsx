/**
 * Admin Protected Route
 * Route guard for admin pages
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * Protected route wrapper for admin pages
 */
export function AdminProtectedRoute({ children }) {
    const { isAuthenticated, isInitialized, isLoading } = useAdminAuth();
    const location = useLocation();

    // Show loading while checking auth
    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
                    <p className="text-dark-400">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    // Redirect to admin login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
}

/**
 * Public-only route for admin login (redirect if already logged in)
 */
export function AdminPublicRoute({ children }) {
    const { isAuthenticated, isInitialized, isLoading } = useAdminAuth();
    const location = useLocation();

    // Show loading while checking auth
    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        return <Navigate to={from} replace />;
    }

    return children;
}

export default AdminProtectedRoute;
