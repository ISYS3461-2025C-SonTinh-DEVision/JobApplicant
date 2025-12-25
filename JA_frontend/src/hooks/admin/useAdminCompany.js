/**
 * useAdminCompany Hook
 * Hook for managing companies in admin panel
 */

import { useState, useCallback, useEffect } from 'react';
import AdminService from '../../services/AdminService';

export default function useAdminCompany(options = {}) {
    const { autoFetch = true, page = 1, limit = 10, search = '' } = options;

    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchCompanies = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await AdminService.getCompanies({
                page: params.page || page,
                limit: params.limit || limit,
                search: params.search !== undefined ? params.search : search,
            });

            setCompanies(response.data || []);
            setTotal(response.total || 0);
            setTotalPages(response.totalPages || 0);

            return response;
        } catch (err) {
            setError(err.message || 'Failed to fetch companies');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    const deactivateCompany = useCallback(async (companyId) => {
        try {
            const result = await AdminService.deactivateCompany(companyId);
            await fetchCompanies();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to deactivate company');
            throw err;
        }
    }, [fetchCompanies]);

    useEffect(() => {
        if (autoFetch) {
            fetchCompanies();
        }
    }, [autoFetch, fetchCompanies]);

    return {
        companies,
        loading,
        error,
        total,
        totalPages,
        fetchCompanies,
        deactivateCompany,
        refresh: fetchCompanies,
    };
}
