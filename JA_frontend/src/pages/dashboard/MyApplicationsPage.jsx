import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ApplicationList } from '../../components/application/ApplicationList';
import { Pagination } from '../../components/reusable/Pagination';
import { useApplications } from '../../hooks/useApplications';
import { useTheme } from '../../context/ThemeContext';

export default function MyApplicationsPage() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const {
        // Data
        applications,
        loading,
        error,
        refreshApplications,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        getSearchInputProps,
        getFilterSelectProps,

        // Pagination
        page,
        totalPages,
        goToPage,
        totalItems,

        // States
        isEmpty,
        isFilteredEmpty
    } = useApplications();

    const handleViewDetails = (app) => {
        navigate(`/dashboard/applications/${app.id}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Applications</h1>
                    <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Track and manage your job applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                        <input
                            {...getSearchInputProps()}
                            className={`
                                w-full pl-9 pr-4 py-2 rounded-xl border outline-none transition-all
                                ${isDark
                                    ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                                }
                            `}
                            placeholder="Search applications..."
                        />
                    </div>
                    <select
                        className={`
                            h-10 px-3 py-2 rounded-xl border outline-none transition-all text-sm
                            ${isDark
                                ? 'bg-dark-800 border-dark-700 text-white focus:border-primary-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                            }
                        `}
                        {...getFilterSelectProps('status')}
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <ApplicationList
                applications={applications}
                loading={loading}
                error={error}
                onViewDetails={handleViewDetails}
                onRetry={refreshApplications}
            />

            {/* Pagination */}
            {!loading && !isEmpty && !isFilteredEmpty && totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    totalItems={totalItems}
                    showInfo={true}
                    variant={isDark ? 'dark' : 'light'}
                />
            )}
        </div>
    );
}
