import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, LayoutGrid, LayoutList, RefreshCw,
    FileText, Clock, CheckCircle, XCircle, Archive, Eye,
    Briefcase, Building2, MapPin, ChevronRight, AlertCircle, AlertTriangle, X
} from 'lucide-react';
import { ApplicationList } from '../../components/application/ApplicationList';
import { Pagination } from '../../components/reusable/Pagination';
import { useApplications } from '../../hooks/useApplications';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../components/headless';
import applicationService from '../../services/ApplicationService';

// Status configuration for timeline view
const STATUS_CONFIG = {
    PENDING: { label: 'Pending', icon: Clock, bgClass: 'bg-yellow-500/20 text-yellow-400' },
    REVIEWING: { label: 'Under Review', icon: Eye, bgClass: 'bg-blue-500/20 text-blue-400' },
    ACCEPTED: { label: 'Accepted', icon: CheckCircle, bgClass: 'bg-green-500/20 text-green-400' },
    REJECTED: { label: 'Rejected', icon: XCircle, bgClass: 'bg-red-500/20 text-red-400' },
    WITHDRAWN: { label: 'Withdrawn', icon: Archive, bgClass: 'bg-gray-500/20 text-gray-400' },
    // Lowercase variants for compatibility
    pending: { label: 'Pending', icon: Clock, bgClass: 'bg-yellow-500/20 text-yellow-400' },
    reviewed: { label: 'Under Review', icon: Eye, bgClass: 'bg-blue-500/20 text-blue-400' },
    accepted: { label: 'Accepted', icon: CheckCircle, bgClass: 'bg-green-500/20 text-green-400' },
    rejected: { label: 'Rejected', icon: XCircle, bgClass: 'bg-red-500/20 text-red-400' },
    withdrawn: { label: 'Withdrawn', icon: Archive, bgClass: 'bg-gray-500/20 text-gray-400' },
};

export default function MyApplicationsPage() {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // View mode toggle state
    const [viewMode, setViewMode] = useState('timeline'); // 'cards' or 'timeline'
    const [withdrawing, setWithdrawing] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // Withdraw confirmation modal using headless useModal hook
    const withdrawModal = useModal({
        closeOnEscape: true,
        closeOnOverlayClick: true,
    });

    const {
        // Data
        applications,
        allApplications,
        loading,
        error,
        refreshApplications,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        getSearchInputProps,
        getFilterSelectProps,
        filters,
        updateFilter,

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

    // Open withdraw confirmation modal
    const openWithdrawModal = (application) => {
        setSelectedApplication(application);
        withdrawModal.open();
    };

    // Execute withdraw after confirmation
    const executeWithdraw = async () => {
        if (!selectedApplication) return;

        setWithdrawing(selectedApplication.id);
        withdrawModal.close();

        try {
            await applicationService.withdrawApplication(selectedApplication.id);
            refreshApplications();
        } catch (err) {
            console.error('Failed to withdraw:', err);
            refreshApplications();
        } finally {
            setWithdrawing(null);
            setSelectedApplication(null);
        }
    };

    // Check if application can be withdrawn
    const canWithdraw = (app) => {
        const status = app.status?.toUpperCase();
        return ['PENDING', 'REVIEWING', 'REVIEWED'].includes(status);
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get time ago
    const getTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return formatDate(dateStr);
    };

    // Count applications by status - use allApplications (full unfiltered data)
    const getStatusCounts = useCallback(() => {
        const counts = { ALL: allApplications?.length || 0 };
        allApplications?.forEach(app => {
            const status = app.status?.toUpperCase() || 'PENDING';
            counts[status] = (counts[status] || 0) + 1;
        });
        return counts;
    }, [allApplications]);

    const statusCounts = getStatusCounts();

    const cardClass = isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}>
                        <FileText className="w-7 h-7 text-primary-500" />
                        My Applications
                    </h1>
                    <p className={`mt-1 ${textSecondary}`}>Track and manage your job applications</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-dark-900' : 'bg-gray-100'}`}>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'cards'
                                ? 'bg-primary-600 text-white shadow-lg'
                                : `${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                                }`}
                            title="Card View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'timeline'
                                ? 'bg-primary-600 text-white shadow-lg'
                                : `${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                                }`}
                            title="Timeline View"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={refreshApplications}
                        className={`p-2 rounded-xl border transition-colors ${isDark
                            ? 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white hover:border-dark-600'
                            : 'bg-white border-gray-300 text-gray-600 hover:text-gray-900'
                            }`}
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 md:max-w-md">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                    <input
                        {...getSearchInputProps()}
                        className={`
                            w-full pl-9 pr-4 py-2.5 rounded-xl border outline-none transition-all
                            ${isDark
                                ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-400 focus:border-primary-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
                            }
                        `}
                        placeholder="Search by job title or company..."
                    />
                </div>

                {/* Status Filter Dropdown (for Card View) */}
                {viewMode === 'cards' && (
                    <select
                        className={`
                            h-11 px-4 py-2 rounded-xl border outline-none transition-all text-sm
                            ${isDark
                                ? 'bg-dark-800 border-dark-700 text-white focus:border-primary-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                            }
                        `}
                        {...getFilterSelectProps('status')}
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWING">Under Review</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                )}
            </div>

            {/* Status Tab Pills (for Timeline View) */}
            {viewMode === 'timeline' && (
                <div className="flex flex-wrap gap-2">
                    {['ALL', 'PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].map((status) => {
                        const isActive = filters?.status?.toUpperCase() === status ||
                            (status === 'ALL' && !filters?.status);
                        const config = STATUS_CONFIG[status];
                        const count = statusCounts[status] || 0;

                        return (
                            <button
                                key={status}
                                onClick={() => updateFilter('status', status === 'ALL' ? '' : status)}
                                className={`
                                    px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                                    ${isActive
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : isDark
                                            ? 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {status === 'ALL' ? 'All' : config?.label || status}
                                <span className={`
                                    px-1.5 py-0.5 rounded-full text-xs
                                    ${isActive
                                        ? 'bg-white/20'
                                        : isDark ? 'bg-dark-700' : 'bg-gray-200'
                                    }
                                `}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Content - Card View */}
            {viewMode === 'cards' && (
                <ApplicationList
                    applications={applications}
                    loading={loading}
                    error={null} // Error handled above
                    onViewDetails={handleViewDetails}
                    onRetry={refreshApplications}
                />
            )}

            {/* Content - Timeline View */}
            {viewMode === 'timeline' && !loading && (
                <div className="space-y-4">
                    {applications?.length > 0 ? (
                        applications.map((application) => {
                            const statusKey = application.status?.toUpperCase() || 'PENDING';
                            const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
                            const StatusIcon = statusConfig.icon;
                            const showWithdraw = canWithdraw(application);

                            return (
                                <div
                                    key={application.id}
                                    className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${cardClass}`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Job Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-3 rounded-xl ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                                                    <Briefcase className={`w-6 h-6 ${textSecondary}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold truncate ${textPrimary}`}>
                                                        {application.jobTitle}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                        <span className={`flex items-center gap-1 text-sm ${textSecondary}`}>
                                                            <Building2 className="w-4 h-4" />
                                                            {application.companyName}
                                                        </span>
                                                        <span className={`flex items-center gap-1 text-sm ${textSecondary}`}>
                                                            <MapPin className="w-4 h-4" />
                                                            {application.location || 'Remote'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status & Date */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgClass}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {statusConfig.label}
                                                </span>
                                                <p className={`text-sm mt-1 ${textSecondary}`}>
                                                    Applied {getTimeAgo(application.appliedDate || application.appliedAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(application)}
                                                    className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-300' : 'hover:bg-gray-100 text-gray-600'
                                                        }`}
                                                    title="View Details"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>

                                                {showWithdraw && (
                                                    <button
                                                        onClick={() => openWithdrawModal(application)}
                                                        disabled={withdrawing === application.id}
                                                        className={`p-2.5 rounded-xl transition-colors ${withdrawing === application.id
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : isDark
                                                                ? 'hover:bg-red-900/30 text-dark-400 hover:text-red-400'
                                                                : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                                                            }`}
                                                        title="Withdraw Application"
                                                    >
                                                        {withdrawing === application.id
                                                            ? <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                                            : <Archive className="w-5 h-5" />
                                                        }
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Preview */}
                                    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                                        <div className="flex items-center gap-4 text-sm overflow-x-auto pb-1">
                                            <TimelineStep
                                                label="Applied"
                                                date={formatDate(application.appliedDate || application.appliedAt)}
                                                active={true}
                                                isDark={isDark}
                                            />
                                            <div className={`h-0.5 w-8 ${['REVIEWING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(statusKey)
                                                ? 'bg-primary-500'
                                                : isDark ? 'bg-dark-600' : 'bg-gray-200'
                                                }`} />
                                            <TimelineStep
                                                label="Reviewing"
                                                date={statusKey === 'REVIEWING' || statusKey === 'REVIEWED' ? 'In progress' : null}
                                                active={['REVIEWING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(statusKey)}
                                                isDark={isDark}
                                            />
                                            <div className={`h-0.5 w-8 ${['ACCEPTED', 'REJECTED'].includes(statusKey)
                                                ? statusKey === 'ACCEPTED' ? 'bg-green-500' : 'bg-red-500'
                                                : isDark ? 'bg-dark-600' : 'bg-gray-200'
                                                }`} />
                                            <TimelineStep
                                                label={statusKey === 'ACCEPTED' ? 'Accepted' : statusKey === 'REJECTED' ? 'Rejected' : 'Decision'}
                                                date={['ACCEPTED', 'REJECTED'].includes(statusKey) ? formatDate(application.updatedAt) : null}
                                                active={['ACCEPTED', 'REJECTED'].includes(statusKey)}
                                                success={statusKey === 'ACCEPTED'}
                                                error={statusKey === 'REJECTED'}
                                                isDark={isDark}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : !loading && (
                        <div className={`text-center py-16 rounded-2xl border ${cardClass}`}>
                            <FileText className={`w-16 h-16 mx-auto mb-4 ${textSecondary}`} />
                            <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>
                                No Applications Found
                            </h3>
                            <p className={`mb-6 ${textSecondary}`}>
                                Start exploring jobs and submit your applications!
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/jobs')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
                            >
                                <Search className="w-5 h-5" />
                                Browse Jobs
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Loading State for Timeline View */}
            {viewMode === 'timeline' && loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            )}

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

            {/* Withdraw Confirmation Modal */}
            {withdrawModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    {...withdrawModal.getOverlayProps()}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

                    {/* Modal Content */}
                    <div
                        className={`
                            relative w-full max-w-md transform transition-all duration-300 ease-out
                            ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}
                            rounded-2xl border shadow-2xl
                        `}
                        {...withdrawModal.getContentProps()}
                    >
                        {/* Close Button */}
                        <button
                            className={`
                                absolute top-4 right-4 p-2 rounded-xl transition-colors
                                ${isDark ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'}
                            `}
                            {...withdrawModal.getCloseButtonProps()}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-red-500/20">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Withdraw Application
                                    </h3>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className={`px-6 py-4 border-t border-b ${isDark ? 'border-dark-700 bg-dark-900/50' : 'border-gray-100 bg-gray-50'}`}>
                            {selectedApplication && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Briefcase className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                                        <div>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {selectedApplication.jobTitle}
                                            </p>
                                            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                {selectedApplication.companyName}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                        Are you sure you want to withdraw your application?
                                        Don't worry — you can reapply for this position later if you change your mind.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-4 flex items-center justify-end gap-3">
                            <button
                                onClick={withdrawModal.close}
                                className={`
                                    px-5 py-2.5 rounded-xl font-medium transition-all
                                    ${isDark
                                        ? 'bg-dark-700 text-dark-200 hover:bg-dark-600 hover:text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeWithdraw}
                                className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/40"
                            >
                                Withdraw Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Timeline Step Component
 */
const TimelineStep = ({ label, date, active, success, error, isDark }) => {
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    return (
        <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`
                w-3 h-3 rounded-full
                ${success ? 'bg-green-500' : error ? 'bg-red-500' : active ? 'bg-primary-500' : isDark ? 'bg-dark-600' : 'bg-gray-300'}
            `} />
            <div>
                <p className={`font-medium ${active ? textPrimary : textSecondary}`}>{label}</p>
                {date && <p className={`text-xs ${textSecondary}`}>{date}</p>}
            </div>
        </div>
    );
};
