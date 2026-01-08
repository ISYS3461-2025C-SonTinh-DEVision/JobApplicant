
/**
 * useJobSearch Hook
 * Manages job fetching and search state
 * 
 * Uses Headless UI pattern internally via useHeadlessDataList for state management
 */
import { useState, useCallback, useEffect } from 'react';
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

    // Initial fetch
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

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
