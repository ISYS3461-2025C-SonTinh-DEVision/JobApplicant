
import { useCallback, useEffect } from 'react';
import applicationService from '../services/ApplicationService';
import useHeadlessDataList from '../components/headless/HeadlessDataList';
import useHeadlessPagination from '../components/headless/HeadlessPagination';
import useHeadlessSearch from '../components/headless/HeadlessSearch';

export function useApplications() {
    // 1. Setup Headless Data List for fetching and state management
    // Uses real API via applicationService (Requirement 3.2.4)
    const {
        items: allApplications,
        loading,
        error,
        fetchData: refreshApplications,
    } = useHeadlessDataList({
        fetchFn: async () => {
            const response = await applicationService.getMyApplications();
            // Handle both array and paginated response
            return Array.isArray(response) ? response : response.content || [];
        },
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
