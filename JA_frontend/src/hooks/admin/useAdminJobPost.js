/**
 * useAdminJobPost Hook
 * Hook for managing job posts in admin panel
 */

import { useState, useCallback, useEffect } from 'react';
import AdminService from '../../services/AdminService';

export default function useAdminJobPost(options = {}) {
    const { autoFetch = true, page = 1, limit = 10, search = '' } = options;

    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchJobPosts = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminService.getJobPosts({
                page: params.page || page,
                limit: params.limit || limit,
                search: params.search !== undefined ? params.search : search,
            });

            setJobPosts(response.data || []);
            setTotal(response.total || 0);
            setTotalPages(response.totalPages || 0);

            return response;
        } catch (err) {
            setError(err.message || 'Failed to fetch job posts');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    const deleteJobPost = useCallback(async (jobPostId) => {
        try {
            const result = await AdminService.deleteJobPost(jobPostId);
            await fetchJobPosts();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete job post');
            throw err;
        }
    }, [fetchJobPosts]);

    useEffect(() => {
        if (autoFetch) {
            fetchJobPosts();
        }
    }, [autoFetch, fetchJobPosts]);

    return {
        jobPosts,
        loading,
        error,
        total,
        totalPages,
        fetchJobPosts,
        deleteJobPost,
        refresh: fetchJobPosts,
    };
}
