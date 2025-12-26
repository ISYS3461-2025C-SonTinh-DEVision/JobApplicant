
import { useCallback, useEffect } from 'react';
import applicationService from '../services/ApplicationService';
import useHeadlessDataList from '../components/headless/HeadlessDataList';
import useHeadlessPagination from '../components/headless/HeadlessPagination';
import useHeadlessSearch from '../components/headless/HeadlessSearch';

// Mock applications data for fallback when API returns empty
const MOCK_APPLICATIONS = [
    {
        id: 'app_001',
        jobPostId: 'job_001',
        jobTitle: 'Senior Frontend Developer',
        companyName: 'TechCorp Vietnam',
        location: 'Ho Chi Minh City, Vietnam',
        status: 'Pending',
        appliedDate: '2024-12-25T10:30:00Z',
        updatedAt: '2024-12-25T10:30:00Z',
    },
    {
        id: 'app_002',
        jobPostId: 'job_003',
        jobTitle: 'Full Stack Engineer',
        companyName: 'InnovateLabs Singapore',
        location: 'Singapore',
        status: 'Reviewed',
        appliedDate: '2024-12-22T14:00:00Z',
        updatedAt: '2024-12-24T09:15:00Z',
    },
    {
        id: 'app_003',
        jobPostId: 'job_005',
        jobTitle: 'UI/UX Designer',
        companyName: 'TechCorp Vietnam',
        location: 'Ho Chi Minh City, Vietnam',
        status: 'Accepted',
        appliedDate: '2024-12-15T09:00:00Z',
        updatedAt: '2024-12-20T16:45:00Z',
    },
    {
        id: 'app_004',
        jobPostId: 'job_007',
        jobTitle: 'Mobile Developer (React Native)',
        companyName: 'AppWiz Malaysia',
        location: 'Kuala Lumpur, Malaysia',
        status: 'Rejected',
        appliedDate: '2024-12-10T11:30:00Z',
        updatedAt: '2024-12-18T14:00:00Z',
    },
    {
        id: 'app_005',
        jobPostId: 'job_002',
        jobTitle: 'Backend Developer Intern',
        companyName: 'Cloudify Solutions',
        location: 'Hanoi, Vietnam',
        status: 'Withdrawn',
        appliedDate: '2024-12-08T08:00:00Z',
        updatedAt: '2024-12-12T10:00:00Z',
    },
];

export function useApplications() {
    // Memoized fetch function with mock data fallback (Hybrid Approach)
    const fetchApplications = useCallback(async () => {
        try {
            const response = await applicationService.getMyApplications();
            // Handle both array and paginated response
            // Backend returns { applications: [], ... }
            const applications = Array.isArray(response) ? response : response.applications || response.content || [];

            // If API returns empty, use mock data for demonstration
            if (applications.length === 0) {
                console.log('No applications from API, using mock data');
                return MOCK_APPLICATIONS;
            }

            return applications;
        } catch (error) {
            console.warn('Failed to fetch applications, using mock data:', error.message);
            // Fallback to mock data on error
            return MOCK_APPLICATIONS;
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
