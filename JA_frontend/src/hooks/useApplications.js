
import { useCallback, useEffect } from 'react';
import applicationService from '../services/ApplicationService';
import {
    useHeadlessDataList,
    useHeadlessPagination,
    useHeadlessSearch
} from '../components/headless';

export function useApplications() {
    // Memoized fetch function - fetches real data only from API
    const fetchApplications = useCallback(async () => {
        try {
            const response = await applicationService.getMyApplications();
            // Handle both array and paginated response
            // Backend returns { applications: [], ... }
            const applications = Array.isArray(response) ? response : response.applications || response.content || [];
            return applications;
        } catch (error) {
            console.error('Failed to fetch applications:', error.message);
            return [];
        }
    }, []);

    // 1. Setup Headless Data List for fetching and state management
    // Uses real API via applicationService with mock fallback (Requirement 3.2.4)
    const {
        items: allApplications,
        loading,
        error,
        fetchData: refreshApplications,
    } = useHeadlessDataList({
        fetchFn: fetchApplications,
        fetchOnMount: true,
    });

    // 2. Setup Headless Search for filtering
    const {
        query,
        setQuery,
        filters,
        updateFilter,
        resetFilters,
        filteredData,
        hasActiveFilters,
        hasActiveSearch,
        getSearchInputProps,
        getFilterSelectProps,
        getClearButtonProps
    } = useHeadlessSearch({
        data: allApplications,
        searchKeys: ['jobTitle', 'companyName'],
        initialFilters: { status: '' }
    });

    // 3. Setup Headless Pagination
    const {
        page,
        totalPages,
        paginatedData,
        goToPage,
        nextPage,
        prevPage,
        setPage,
        getPageNumbers,
        startItem,
        endItem,
        totalItems
    } = useHeadlessPagination({
        data: filteredData,
        initialPageSize: 9
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [query, filters, setPage]);

    // Derived Values
    const isEmpty = !loading && (!allApplications || allApplications.length === 0);
    const isFilteredEmpty = !loading && filteredData && filteredData.length === 0 && (hasActiveSearch || hasActiveFilters);

    return {
        // Data
        applications: paginatedData,
        allApplications, // Full unfiltered data for status counts
        loading,
        error,
        refreshApplications,

        // Search & Filter
        searchQuery: query,
        setSearchQuery: setQuery,
        filters,
        updateFilter,
        resetFilters,
        hasActiveFilters,
        hasActiveSearch,
        getSearchInputProps,
        getFilterSelectProps,
        getClearButtonProps,

        // Pagination
        page,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        getPageNumbers,
        startItem,
        endItem,
        totalItems,

        // UI States
        isEmpty,
        isFilteredEmpty
    };
}
