/**
 * useAdminApplicant Hook
 * Hook for managing applicants in admin panel
 */

import { useState, useCallback, useEffect } from 'react';
import AdminService from '../../services/AdminService';

export default function useAdminApplicant(options = {}) {
    const { autoFetch = true, page = 1, limit = 10, search = '' } = options;

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchApplicants = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminService.getApplicants({
                page: params.page || page,
                limit: params.limit || limit,
                search: params.search !== undefined ? params.search : search,
            });

            setApplicants(response.data || []);
            setTotal(response.total || 0);
            setTotalPages(response.totalPages || 0);

            return response;
        } catch (err) {
            setError(err.message || 'Failed to fetch applicants');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    const deactivateApplicant = useCallback(async (applicantId) => {
        try {
            const result = await AdminService.deactivateApplicant(applicantId);
            // Refresh list after deactivation
            await fetchApplicants();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to deactivate applicant');
            throw err;
        }
    }, [fetchApplicants]);

    useEffect(() => {
        if (autoFetch) {
            fetchApplicants();
        }
    }, [autoFetch, fetchApplicants]);

    return {
        applicants,
        loading,
        error,
        total,
        totalPages,
        fetchApplicants,
        deactivateApplicant,
        refresh: fetchApplicants,
    };
}
