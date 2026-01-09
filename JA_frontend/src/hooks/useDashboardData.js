/**
 * useDashboardData Hook
 * 
 * Custom hook for managing dashboard data with caching and loading states.
 * Uses a stale-while-revalidate pattern for optimal UX.
 * 
 * Architecture:
 * - A.3.a (Ultimo Frontend) - Custom Hook Pattern
 * - Integrates with DashboardService for data fetching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import dashboardService from '../services/DashboardService';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export default function useDashboardData() {
    // State
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    // Refs
    const fetchingRef = useRef(false);
    const mountedRef = useRef(true);

    /**
     * Fetch dashboard data from service
     */
    const fetchData = useCallback(async (force = false) => {
        // Prevent duplicate fetches
        if (fetchingRef.current && !force) return;

        // Check cache validity
        if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION && data) {
            return;
        }

        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await dashboardService.getDashboardData();

            if (!mountedRef.current) return;

            if (response.success) {
                setData(response.data);
                setLastFetched(Date.now());
                setError(null);
            } else {
                setError(response.error || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            if (!mountedRef.current) return;
            console.error('[useDashboardData] Error:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                fetchingRef.current = false;
            }
        }
    }, [data, lastFetched]);

    /**
     * Force refresh data
     */
    const refresh = useCallback(() => {
        return fetchData(true);
    }, [fetchData]);

    /**
     * Check if data is stale
     */
    const isStale = useCallback(() => {
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_DURATION;
    }, [lastFetched]);

    // Initial fetch
    useEffect(() => {
        mountedRef.current = true;
        fetchData();

        return () => {
            mountedRef.current = false;
        };
    }, [fetchData]);

    // Derived data with defaults
    const stats = data?.stats || {
        totalApplications: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        profileViews: 0,
        applicationsTrend: 0,
        acceptedTrend: 0,
        profileViewsTrend: 0,
    };

    const profileCompletion = data?.profileCompletion || {
        percentage: 0,
        missingFields: [],
        completedFields: [],
    };

    const recentApplications = data?.recentApplications || [];
    const recentActivity = data?.recentActivity || [];
    const subscription = data?.subscription || { plan: 'FREEMIUM', status: 'inactive' };
    const profile = data?.profile || null;

    // Computed values
    const isPremium = subscription?.plan === 'PREMIUM' && subscription?.status === 'ACTIVE';
    const hasApplications = recentApplications.length > 0;
    const hasActivity = recentActivity.length > 0;

    return {
        // Data
        stats,
        profileCompletion,
        recentApplications,
        recentActivity,
        subscription,
        profile,

        // Computed
        isPremium,
        hasApplications,
        hasActivity,

        // State
        loading,
        error,
        isStale: isStale(),
        lastFetched,

        // Actions
        refresh,
    };
}

// Export for testing
export { CACHE_DURATION };
