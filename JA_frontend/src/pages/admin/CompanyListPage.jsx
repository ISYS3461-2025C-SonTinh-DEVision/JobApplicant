/**
 * Company List Page
 * Admin page for viewing and managing companies
 * 
 * Note: Company data comes from Job Manager subsystem
 * Architecture: A.3.a - Headless UI Pattern (Ultimo Level)
 * Uses: Modal, useModal, useHeadlessTable, useHeadlessSearch, useHeadlessPagination
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Building2, Crown, MapPin, MoreVertical, Ban, Eye, Loader2, RefreshCw, Briefcase, AlertCircle, X, Phone, Calendar, Info, Globe, Mail, CheckCircle } from 'lucide-react';
import { Modal, useModal, useHeadlessTable, useHeadlessSearch, useHeadlessPagination } from '../../components/headless';
import useHeadlessNotification from '../../components/headless/HeadlessNotification';
import { useConfirmationModal } from '../../components/common/ConfirmationModal';
import { ToastContainer } from '../../components/reusable/Toast';
import AdminService from '../../services/AdminService';

// Status Badge Component
function StatusBadge({ status, isPremium }) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
                }`}>
                {status}
            </span>
            {isPremium && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                    <Crown className="w-3 h-3" />
                    Premium
                </span>
            )}
        </div>
    );
}

// Action Menu Component - Fixed positioning
function ActionMenu({ company, onDeactivate, onActivate, onView }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
                <MoreVertical className="w-4 h-4 text-dark-400" />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="fixed sm:absolute right-4 sm:right-0 top-auto sm:top-full mt-1 w-44 bg-dark-800 border border-white/20 rounded-xl shadow-2xl py-1 animate-fade-in"
                    style={{ zIndex: 9999 }}
                >
                    <button
                        onClick={() => { onView(company); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>
                    {company.status === 'active' ? (
                        <button
                            onClick={() => { onDeactivate(company); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                        >
                            <Ban className="w-4 h-4" />
                            Deactivate
                        </button>
                    ) : (
                        <button
                            onClick={() => { onActivate && onActivate(company); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-green-400 hover:bg-green-500/10"
                        >
                            <Eye className="w-4 h-4" />
                            Activate
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Mobile Company Card Component
function CompanyCard({ company, onDeactivate, onActivate, onView, actionLoading }) {
    return (
        <div className="glass-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                        <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-12 h-12 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white font-medium text-lg">
                            {company.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-white">{company.name}</p>
                        <p className="text-sm text-dark-400">{company.industry}</p>
                    </div>
                </div>
                {actionLoading === company.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                ) : (
                    <ActionMenu
                        company={company}
                        onDeactivate={onDeactivate}
                        onActivate={onActivate}
                        onView={onView}
                    />
                )}
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                    <MapPin className="w-4 h-4 text-dark-500 flex-shrink-0" />
                    <span>{company.city}{company.city && company.country ? ', ' : ''}{company.country}</span>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                    <Briefcase className="w-4 h-4 text-dark-500 flex-shrink-0" />
                    <span>{company.jobPostCount || 0} job posts</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <StatusBadge status={company.status} isPremium={company.isPremium} />
            </div>
        </div>
    );
}

export default function CompanyListPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);
    const [isRealData, setIsRealData] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Headless Modal hook for company details
    const companyDetailModal = useModal();

    // Headless Notification hook for toast feedback
    const { notifications, addNotification, dismissNotification } = useHeadlessNotification({
        autoDismissMs: 4000,
    });

    // Confirmation Modal hook for beautiful confirm dialogs
    const confirmModal = useConfirmationModal();

    const {
        query: searchQuery,
        setQuery: setSearchQuery,
        debouncedQuery,
    } = useHeadlessSearch({
        debounceMs: 300,
    });

    const {
        currentPage,
        pageSize,
        totalPages,
        nextPage,
        prevPage,
        canGoNext,
        canGoPrev,
        setTotalItems: setPaginationTotal,
    } = useHeadlessPagination({
        initialPage: 1,
        initialPageSize: 10,
    });

    const {
        toggleSort,
        sortedData,
        getSortIcon,
    } = useHeadlessTable({
        data: companies,
        defaultSortKey: 'name',
        defaultDirection: 'asc',
    });

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        setApiError(null);
        try {
            const response = await AdminService.getCompanies({
                page: currentPage,
                limit: pageSize,
                search: debouncedQuery,
            });

            setCompanies(response.data || []);
            setTotalItems(response.total || 0);
            setPaginationTotal(response.total || 0);
            setIsRealData(response.isRealData === true);

            if (response.error) {
                setApiError(response.error);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            setApiError(error.message || 'Failed to fetch companies');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedQuery, setPaginationTotal]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleDeactivate = async (company) => {
        const confirmed = await confirmModal.confirm({
            type: 'deactivate',
            title: 'Deactivate Company',
            itemName: company.name,
            message: `Are you sure you want to deactivate this company? This will suspend their access until reactivated.`,
            confirmLabel: 'Deactivate',
            cancelLabel: 'Cancel',
        });

        if (!confirmed) return;

        setActionLoading(company.id);
        try {
            const result = await AdminService.deactivateCompany(company.id);
            if (result.success) {
                fetchCompanies();
                addNotification({
                    type: 'success',
                    title: 'Company Deactivated',
                    message: `${company.name} has been successfully deactivated.`,
                });
            } else {
                addNotification({
                    type: 'error',
                    title: 'Deactivation Failed',
                    message: result.message || 'Failed to deactivate company. Please try again.',
                });
            }
        } catch (error) {
            console.error('Failed to deactivate company:', error);
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred. Please try again.',
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivate = async (company) => {
        const confirmed = await confirmModal.confirm({
            type: 'info',
            title: 'Activate Company',
            itemName: company.name,
            message: `Are you sure you want to activate this company? This will restore their access to the platform.`,
            confirmLabel: 'Activate',
            cancelLabel: 'Cancel',
        });

        if (!confirmed) return;

        setActionLoading(company.id);
        try {
            const result = await AdminService.activateCompany(company.id);
            if (result.success) {
                fetchCompanies();
                addNotification({
                    type: 'success',
                    title: 'Company Activated',
                    message: `${company.name} has been successfully activated.`,
                });
            } else {
                addNotification({
                    type: 'error',
                    title: 'Activation Failed',
                    message: result.message || 'Failed to activate company. Please try again.',
                });
            }
        } catch (error) {
            console.error('Failed to activate company:', error);
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred. Please try again.',
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleView = (company) => {
        setSelectedCompany(company);
        companyDetailModal.open();
    };

    const closeDetailModal = () => {
        companyDetailModal.close();
        setSelectedCompany(null);
    };

    const columns = [
        { key: 'name', label: 'Company', sortable: true },
        { key: 'industry', label: 'Industry', sortable: true },
        { key: 'country', label: 'Location', sortable: true },
        { key: 'jobPostCount', label: 'Jobs', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'actions', label: '', sortable: false },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        <Building2 className="w-6 sm:w-7 h-6 sm:h-7 text-pink-400" />
                        Companies
                    </h1>
                    <p className="text-dark-400 mt-1 text-sm sm:text-base">
                        Manage registered companies • {totalItems} total
                    </p>
                </div>
                <button
                    onClick={fetchCompanies}
                    className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* API Status Notice */}
            {apiError ? (
                <div className="glass-card p-4 border-l-4 border-red-400/50 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-medium text-sm">Failed to load companies</p>
                        <p className="text-dark-400 text-xs sm:text-sm mt-1">
                            {apiError}. Try refreshing the page.
                        </p>
                    </div>
                </div>
            ) : isRealData ? (
                <div className="glass-card p-4 border-l-4 border-green-400/50 flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-medium text-sm">Connected to Job Manager API</p>
                        <p className="text-dark-400 text-xs sm:text-sm mt-1">
                            Showing real company data from Job Manager system.
                        </p>
                    </div>
                </div>
            ) : null}

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search by company name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile View - Card Layout */}
            <div className="block lg:hidden space-y-4">
                {loading ? (
                    <div className="glass-card p-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-400 mx-auto" />
                        <p className="text-dark-400 mt-2">Loading companies...</p>
                    </div>
                ) : sortedData.length === 0 ? (
                    <div className="glass-card p-12 text-center text-dark-400">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No companies found</p>
                        <p className="text-xs mt-2">Companies will appear here once Job Manager is integrated</p>
                    </div>
                ) : (
                    sortedData.map((company) => (
                        <CompanyCard
                            key={company.id}
                            company={company}
                            onDeactivate={handleDeactivate}
                            onActivate={handleActivate}
                            onView={handleView}
                            actionLoading={actionLoading}
                        />
                    ))
                )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block glass-card overflow-visible">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                                        className={`px-6 py-4 text-left text-sm font-medium text-dark-300 ${col.sortable ? 'cursor-pointer hover:text-white' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.label}
                                            {col.sortable && getSortIcon(col.key) !== 'none' && (
                                                <span className="text-pink-400">
                                                    {getSortIcon(col.key) === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-pink-400 mx-auto" />
                                        <p className="text-dark-400 mt-2">Loading companies...</p>
                                    </td>
                                </tr>
                            ) : sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-dark-400">
                                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No companies found</p>
                                        <p className="text-xs mt-2">Companies will appear here once Job Manager is integrated</p>
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((company) => (
                                    <tr
                                        key={company.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {company.logoUrl ? (
                                                    <img
                                                        src={company.logoUrl}
                                                        alt={company.name}
                                                        className="w-10 h-10 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white font-medium">
                                                        {company.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-white">{company.name}</p>
                                                    <p className="text-sm text-dark-400">{company.email || company.phoneNumber || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-dark-300">
                                            {company.industry}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-dark-300">
                                                <MapPin className="w-4 h-4 text-dark-500" />
                                                {company.city}, {company.country}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-dark-300">
                                                <Briefcase className="w-4 h-4 text-dark-500" />
                                                {company.jobPostCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={company.status} isPremium={company.isPremium} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {actionLoading === company.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                                            ) : (
                                                <ActionMenu
                                                    company={company}
                                                    onDeactivate={handleDeactivate}
                                                    onActivate={handleActivate}
                                                    onView={handleView}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-dark-400">
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevPage}
                                disabled={!canGoPrev}
                                className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-dark-300">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={!canGoNext}
                                className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {totalPages > 1 && (
                <div className="block lg:hidden glass-card p-4">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-dark-400">
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                        </p>
                        <div className="flex items-center gap-2 w-full">
                            <button
                                onClick={prevPage}
                                disabled={!canGoPrev}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-dark-300 text-sm">
                                {currentPage}/{totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={!canGoNext}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Company Detail Modal - uses headless Modal per Ultimo A.3.a */}
            <Modal controller={companyDetailModal}>
                <Modal.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <Modal.Content className="relative bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
                        {/* Header with gradient */}
                        <Modal.Header className="relative px-6 py-5 bg-gradient-to-r from-pink-600/20 to-violet-600/20 border-b border-white/10">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {selectedCompany?.logoUrl ? (
                                        <img
                                            src={selectedCompany.logoUrl}
                                            alt={selectedCompany.name}
                                            className="w-16 h-16 rounded-xl object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                                            {selectedCompany?.name?.charAt(0) || 'C'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-white truncate">
                                            {selectedCompany?.name}
                                        </h2>
                                        {selectedCompany?.industry && (
                                            <p className="text-dark-400 text-sm mt-1">{selectedCompany.industry}</p>
                                        )}
                                    </div>
                                </div>
                                <Modal.CloseButton className="p-2 rounded-lg hover:bg-white/10 transition-colors text-dark-400 hover:text-white flex-shrink-0">
                                    <X className="w-5 h-5" />
                                </Modal.CloseButton>
                            </div>
                        </Modal.Header>

                        {/* Body - scrollable */}
                        <Modal.Body className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
                            {/* Status badges */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <StatusBadge status={selectedCompany?.status} isPremium={selectedCompany?.isPremium} />
                                {selectedCompany?.uniqueID && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                        ID: {selectedCompany.uniqueID.slice(0, 20)}...
                                    </span>
                                )}
                            </div>

                            {/* Key information cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Location */}
                                <div className="glass-card p-4 flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-pink-500/20">
                                        <MapPin className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-dark-400 text-xs uppercase tracking-wide">Location</p>
                                        <p className="text-white font-semibold mt-1 truncate">
                                            {selectedCompany?.city || 'N/A'}
                                            {selectedCompany?.city && selectedCompany?.country && ', '}
                                            {selectedCompany?.country}
                                        </p>
                                        {selectedCompany?.street && (
                                            <p className="text-dark-300 text-sm mt-0.5 truncate">{selectedCompany.street}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="glass-card p-4 flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/20">
                                        <Phone className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-dark-400 text-xs uppercase tracking-wide">Phone</p>
                                        <p className="text-white font-semibold mt-1">
                                            {selectedCompany?.phoneNumber || 'Not provided'}
                                        </p>
                                    </div>
                                </div>

                                {/* Created Date */}
                                <div className="glass-card p-4 flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/20">
                                        <Calendar className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-dark-400 text-xs uppercase tracking-wide">Registered</p>
                                        <p className="text-white font-semibold mt-1">
                                            {selectedCompany?.createdAt
                                                ? new Date(selectedCompany.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : 'Unknown'}
                                        </p>
                                    </div>
                                </div>

                                {/* Job Posts */}
                                <div className="glass-card p-4 flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/20">
                                        <Briefcase className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-dark-400 text-xs uppercase tracking-wide">Job Posts</p>
                                        <p className="text-white font-semibold mt-1">
                                            {selectedCompany?.jobPostCount || 0} positions
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* About Us */}
                            {selectedCompany?.aboutUs && (
                                <div>
                                    <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        About Company
                                    </h3>
                                    <div className="glass-card p-4">
                                        <p className="text-dark-200 leading-relaxed whitespace-pre-wrap">
                                            {selectedCompany.aboutUs}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Metadata section */}
                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wide mb-3">Details</h3>
                                <div className="space-y-2 text-sm">
                                    {selectedCompany?.uniqueID && (
                                        <div className="flex justify-between">
                                            <span className="text-dark-400">Unique ID</span>
                                            <span className="text-dark-200 font-mono text-xs">{selectedCompany.uniqueID}</span>
                                        </div>
                                    )}
                                    {selectedCompany?.createdAt && (
                                        <div className="flex justify-between">
                                            <span className="text-dark-400">Created At</span>
                                            <span className="text-dark-200">{new Date(selectedCompany.createdAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedCompany?.updatedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-dark-400">Last Updated</span>
                                            <span className="text-dark-200">{new Date(selectedCompany.updatedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Modal.Body>

                        {/* Footer */}
                        <Modal.Footer className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
                            {selectedCompany?.status === 'active' ? (
                                <button
                                    onClick={() => { handleDeactivate(selectedCompany); closeDetailModal(); }}
                                    className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium flex items-center gap-2"
                                >
                                    <Ban className="w-4 h-4" />
                                    Deactivate
                                </button>
                            ) : (
                                <button
                                    onClick={() => { handleActivate(selectedCompany); closeDetailModal(); }}
                                    className="px-4 py-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors font-medium flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    Activate
                                </button>
                            )}
                            <Modal.CloseButton className="px-6 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-medium">
                                Close
                            </Modal.CloseButton>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal.Overlay>
            </Modal>

            {/* Toast Notifications Container */}
            <ToastContainer
                notifications={notifications}
                onDismiss={dismissNotification}
                position="top-right"
            />

            {/* Confirmation Modal (renders automatically when confirm() is called) */}
            <confirmModal.ConfirmModal />
        </div>
    );
}
