import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import JobList from '../../components/job/JobList';
import FilterSidebar from '../../components/job/FilterSidebar';
import { useJobSearch } from '../../hooks/useJobSearch';
import { useJobPagination } from '../../hooks/useJobPagination';
import { useTheme } from '../../context/ThemeContext';

const JobListPage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // Default country filter can be passed here if needed, but we use the new Location dropdown default logic
    const defaultSearchFilters = useMemo(() => ({}), []);

    // Local State for Dynamic Filters
    const [filters, setFilters] = useState({
        location: '', // Changed default to empty (All Locations) or 'Vietnam' if desired
        employmentType: null, // Changed to null for single select logic
        minSalary: '',
        maxSalary: '',
        fresher: false,
        search: ''
    });

    const [showFilters, setShowFilters] = useState(false); // Collapsed by default

    const {
        jobs,
        loading,
        error,
        fetchJobs,
        total
    } = useJobSearch(defaultSearchFilters);

    const {
        page,
        size,
        loadMore,
        resetPagination,
        updateHasMore,
        hasMore
    } = useJobPagination();

    // 1. Handle Filter Changes
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        resetPagination();
    }, [resetPagination]);

    // 2. Main Data Fetch Effect
    useEffect(() => {
        const fetch = async () => {
            const queryParams = {
                ...filters,
                page,
                size
            };

            const isAppend = page > 1;

            const data = await fetchJobs(queryParams, isAppend);

            if (data) {
                updateHasMore(9999, data.length === size ? 999 : 9999);
            }
        };

        fetch();

    }, [page, size, filters.employmentType, filters.location, filters.minSalary, filters.maxSalary, filters.fresher, filters.search, fetchJobs, updateHasMore]);

    useEffect(() => {
        updateHasMore(total, jobs.length);
    }, [total, jobs.length, updateHasMore]);

    const handleViewJob = (job) => {
        navigate(`/jobs/${job.id}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Jobs</h1>
                    <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        Find your next career opportunity
                    </p>
                </div>

                {/* Search Bar & Filter Toggle */}
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${isDark
                                ? `${showFilters ? 'bg-primary-600 border-primary-500 text-white' : 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white'}`
                                : `${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`
                            }`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-5 h-5" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>

                    <div className="relative w-full md:w-72">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={filters.search}
                            className={`
                                w-full pl-9 pr-4 py-2 rounded-xl border outline-none transition-colors
                                ${isDark
                                    ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-400 focus:border-primary-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
                                }
                            `}
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar - Collapsible */}
                {showFilters && (
                    <div className="w-full lg:w-72 flex-shrink-0 animate-fade-in-down lg:animate-fade-in-left">
                        <div className={`p-5 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                            <FilterSidebar
                                filters={filters}
                                onFilterChange={(newValues) => setFilters(prev => ({ ...prev, ...newValues }))}
                                onReset={() => setFilters({
                                    location: '',
                                    employmentType: null,
                                    minSalary: '',
                                    maxSalary: '',
                                    fresher: false,
                                    search: ''
                                })}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 w-full space-y-6">
                    {/* Active Filters Summary*/}
                    {(filters.employmentType || filters.location || filters.fresher) && (
                        <div className="flex flex-wrap gap-2">
                            {filters.location && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${isDark ? 'bg-dark-800 border-dark-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
                                    {filters.location}
                                    <button onClick={() => handleFilterChange({ location: '' })}><Filter className="w-3 h-3 rotate-45" /></button>
                                </span>
                            )}
                            {filters.employmentType && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${isDark ? 'bg-dark-800 border-dark-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}>
                                    {filters.employmentType}
                                    <button onClick={() => handleFilterChange({ employmentType: null })}><Filter className="w-3 h-3 rotate-45" /></button>
                                </span>
                            )}
                            {filters.fresher && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${isDark ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                    Fresher Friendly
                                    <button onClick={() => handleFilterChange({ fresher: false })}><Filter className="w-3 h-3 rotate-45" /></button>
                                </span>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                            {error}
                        </div>
                    )}

                    <JobList
                        jobs={jobs}
                        loading={loading && page === 1}
                        variant={isDark ? 'dark' : 'light'}
                        onView={handleViewJob}
                        onApply={(job) => console.log('Apply', job.id)}
                        onSave={(job) => console.log('Save', job.id)}
                    />

                    {loading && page > 1 && (
                        <div className="py-4 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                        </div>
                    )}

                    {!loading && jobs.length > 0 && hasMore && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={loadMore}
                                className={`
                                    px-6 py-2.5 font-medium rounded-lg transition-colors border
                                    ${isDark
                                        ? 'bg-dark-800 border-dark-700 text-dark-200 hover:bg-dark-700'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                Load More Jobs
                            </button>
                        </div>
                    )}

                    {!loading && jobs.length === 0 && !error && (
                        <div className={`text-center py-12 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            No jobs match your filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobListPage;
