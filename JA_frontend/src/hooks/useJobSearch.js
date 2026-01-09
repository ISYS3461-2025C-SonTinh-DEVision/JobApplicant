
/**
 * useJobSearch Hook
 * Manages job fetching and search state
 * 
 * Uses Headless UI pattern internally via useHeadlessDataList for state management
 * Note: Does NOT auto-fetch on mount - the component should call fetchJobs with proper filters
 */
import { useState, useCallback } from 'react';
import JobSearchService from '../services/JobSearchService';

export const useJobSearch = (initialFilters = {}) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);

    const fetchJobs = useCallback(async (filters = {}, append = false) => {
        setLoading(true);
        setError(null);
        try {
            const response = await JobSearchService.getJobs({ ...initialFilters, ...filters });
            // Handle both mocked format { data: [], total: N } 
            const data = response.data || response;
            const totalCount = response.total || (Array.isArray(data) ? data.length : 0);

            setJobs(prev => append ? [...prev, ...data] : data);
            setTotal(totalCount);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch jobs');
            if (!append) setJobs([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [initialFilters]);

    // Note: Removed initial fetch - component should control when to fetch with proper filters
    // This prevents duplicate API calls when component has its own fetch effect

    return {
        jobs,
        loading,
        error,
        total,
        fetchJobs,
        setJobs // Exposed for client-side sorting/filtering if needed
    };
};

export default useJobSearch;
