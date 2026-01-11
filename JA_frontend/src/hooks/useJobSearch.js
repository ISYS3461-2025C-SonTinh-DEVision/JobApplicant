
/**
 * useJobSearch Hook
 * Manages job fetching and search state
 * 
 * Uses Headless UI pattern internally via useHeadlessDataList for state management
 * Note: Does NOT auto-fetch on mount - the component should call fetchJobs with proper filters
 * 
 * Also reports JM API connection status for visual indicator
 */
import { useState, useCallback, useContext } from 'react';
import JobSearchService from '../services/JobSearchService';
import JMConnectionContext from '../context/JMConnectionContext';

export const useJobSearch = (initialFilters = {}) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);

    // JM Connection status reporting (optional - may be null if outside provider)
    const jmConnection = useContext(JMConnectionContext);

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

            // Report connection status based on whether we fell back to mock
            if (jmConnection) {
                if (JobSearchService.isUsingMock()) {
                    // API failed, using mock data - report as disconnected
                    jmConnection.reportError?.('API unavailable - using cached data');
                } else {
                    // Real API succeeded - report as connected
                    jmConnection.reportSuccess?.();
                }
            }

            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch jobs');
            if (!append) setJobs([]);

            // Report error to JM Connection context
            if (jmConnection?.reportError) {
                jmConnection.reportError(err.message || 'Connection failed');
            }

            return [];
        } finally {
            setLoading(false);
        }
    }, [initialFilters, jmConnection]);

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
