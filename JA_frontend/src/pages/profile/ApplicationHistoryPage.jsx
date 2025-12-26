/**
 * Application History Page
 * 
 * Displays the user's job application history with filtering and search.
 * Uses real API via ApplicationService instead of mock data.
 * 
 * Architecture:
 * - A.3.a (Ultimo): Uses Headless UI hooks (HeadlessTable, HeadlessSearch, HeadlessPagination)
 * - A.2.a: Uses reusable UI components
 * - Requirement 3.2.4: Display current and past applications
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Search, Filter, ChevronRight, ExternalLink, RefreshCw,
    Clock, CheckCircle, XCircle, Hourglass, Archive, Loader2, AlertCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import applicationService from '../../services/ApplicationService';
import { useHeadlessSearch, useHeadlessPagination } from '../../components/headless';
import { ApplicationHistoryTable, ApplicationHistoryCard } from '../../components/profile/ApplicationHistoryTable';

// Status filter options
const STATUS_OPTIONS = [
    { value: 'all', label: 'All Applications', icon: FileText },
    { value: 'PENDING', label: 'Pending', icon: Hourglass },
    { value: 'REVIEWING', label: 'Under Review', icon: Clock },
    { value: 'ACCEPTED', label: 'Accepted', icon: CheckCircle },
    { value: 'REJECTED', label: 'Rejected', icon: XCircle },
    { value: 'WITHDRAWN', label: 'Withdrawn', icon: Archive },
];

/**
 * Status Filter Tabs
 */
function StatusTabs({ value, onChange, counts = {}, variant = 'dark' }) {
    const tabBg = variant === 'dark'
        ? 'bg-dark-800/50 border-dark-700'
        : 'bg-gray-100 border-gray-200';

    const activeTabBg = variant === 'dark'
        ? 'bg-primary-600 text-white'
        : 'bg-primary-600 text-white';

    const inactiveTabBg = variant === 'dark'
        ? 'text-dark-400 hover:text-white hover:bg-dark-700'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200';

    return (
        <div className={`flex flex-wrap gap-2 p-1 rounded-xl border ${tabBg}`}>
            {STATUS_OPTIONS.map(({ value: optValue, label, icon: Icon }) => {
                const isActive = value === optValue;
                const count = optValue === 'all'
                    ? Object.values(counts).reduce((a, b) => a + b, 0)
                    : counts[optValue] || 0;

                return (
                    <button
                        key={optValue}
                        onClick={() => onChange(optValue)}
                        className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive ? activeTabBg : inactiveTabBg}
            `}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{label}</span>
                        {count > 0 && (
                            <span className={`
                px-1.5 py-0.5 rounded-full text-xs
                ${isActive ? 'bg-white/20' : variant === 'dark' ? 'bg-dark-600' : 'bg-gray-200'}
              `}>
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Application History Page
 */
export default function ApplicationHistoryPage() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { currentUser } = useAuth();

    // State
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    // Search hook
    const { searchQuery, setSearchQuery, filteredData: searchedApplications } = useHeadlessSearch({
        data: applications,
        searchKeys: ['jobTitle', 'company'],
        debounceMs: 300,
    });

    // Filter by status
    const filteredApplications = searchedApplications.filter(app =>
        statusFilter === 'all' || app.status === statusFilter
    );

    // Pagination hook
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        paginatedData,
        totalPages,
        totalItems,
    } = useHeadlessPagination({
        data: filteredApplications,
        initialPageSize: 10,
    });

    // Count by status
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    // Fetch applications
    const fetchApplications = useCallback(async () => {
        if (!currentUser?.userId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await applicationService.getApplicationHistory();
            // Handle both array and paginated response
            const apps = Array.isArray(response) ? response : response.content || [];
            setApplications(apps);
        } catch (err) {
            console.error('[ApplicationHistoryPage] Error fetching applications:', err);
            setError(err.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, [currentUser?.userId]);

    // Refresh handler
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchApplications();
        setRefreshing(false);
    };

    // Initial fetch
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Handlers
    const handleViewApplication = (application) => {
        navigate(`/dashboard/applications/${application.id}`);
    };

    const handleViewJob = (application) => {
        navigate(`/dashboard/jobs/${application.jobId}`);
    };

    const handleWithdraw = async (application) => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) {
            return;
        }

        try {
            await applicationService.withdrawApplication(application.id);
            // Update local state
            setApplications(prev =>
                prev.map(app =>
                    app.id === application.id
                        ? { ...app, status: 'WITHDRAWN' }
                        : app
                )
            );
        } catch (err) {
            console.error('[ApplicationHistoryPage] Error withdrawing application:', err);
            alert('Failed to withdraw application. Please try again.');
        }
    };

    // Theme classes
    const bgClass = isDark ? 'bg-dark-900' : 'bg-gray-50';
    const cardClass = isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm';
    const textClass = isDark ? 'text-white' : 'text-gray-900';
    const subTextClass = isDark ? 'text-dark-400' : 'text-gray-500';

    return (
        <div className={`min-h-screen ${bgClass} p-4 sm:p-6`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className={`text-2xl font-bold ${textClass}`}>Application History</h1>
                        <p className={`text-sm ${subTextClass}`}>
                            Track and manage your job applications
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${isDark
                                    ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
              `}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className={`p-4 rounded-xl border mb-6 ${cardClass}`}>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subTextClass}`} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by job title or company..."
                                    className={`
                    w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors
                    ${isDark
                                            ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500'
                                        }
                    focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  `}
                                />
                            </div>
                        </div>

                        {/* Status Tabs */}
                        <StatusTabs
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setCurrentPage(0); // Reset to first page on filter change
                            }}
                            counts={statusCounts}
                            variant={isDark ? 'dark' : 'light'}
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                            <p className={subTextClass}>Loading applications...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className={`p-6 rounded-xl border ${cardClass}`}>
                        <div className="text-center py-10">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <p className={`text-lg font-medium ${textClass} mb-2`}>Failed to load applications</p>
                            <p className={`text-sm ${subTextClass} mb-4`}>{error}</p>
                            <button onClick={handleRefresh} className="btn-primary">
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className={`p-6 rounded-xl border ${cardClass}`}>
                        <div className="text-center py-16">
                            <FileText className={`w-16 h-16 mx-auto mb-4 ${subTextClass}`} />
                            <p className={`text-lg font-medium ${textClass} mb-2`}>
                                {searchQuery || statusFilter !== 'all'
                                    ? 'No applications match your filters'
                                    : 'No applications yet'
                                }
                            </p>
                            <p className={`text-sm ${subTextClass} mb-6`}>
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Start applying to jobs to see your applications here'
                                }
                            </p>
                            {!searchQuery && statusFilter === 'all' && (
                                <button
                                    onClick={() => navigate('/dashboard/jobs')}
                                    className="btn-primary"
                                >
                                    Browse Jobs
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className={`hidden md:block rounded-xl border overflow-hidden ${cardClass}`}>
                            <ApplicationHistoryTable
                                applications={paginatedData}
                                onView={handleViewApplication}
                                onViewJob={handleViewJob}
                                onWithdraw={handleWithdraw}
                                variant={isDark ? 'dark' : 'light'}
                            />
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {paginatedData.map((application) => (
                                <ApplicationHistoryCard
                                    key={application.id}
                                    application={application}
                                    onView={handleViewApplication}
                                    onViewJob={handleViewJob}
                                    variant={isDark ? 'dark' : 'light'}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className={`text-sm ${subTextClass}`}>
                                    Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className={`
                      px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50
                      ${isDark
                                                ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }
                    `}
                                    >
                                        Previous
                                    </button>
                                    <span className={`text-sm ${subTextClass}`}>
                                        Page {currentPage + 1} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className={`
                      px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50
                      ${isDark
                                                ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }
                    `}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
