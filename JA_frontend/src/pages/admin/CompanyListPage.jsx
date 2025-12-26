/**
 * Company List Page
 * Admin page for viewing and managing companies
 * 
 * Note: Company data comes from Job Manager subsystem
 * Uses: useHeadlessTable, useHeadlessSearch, useHeadlessPagination
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Building2, Crown, MapPin, MoreVertical, Ban, Eye, Loader2, RefreshCw, Briefcase, AlertCircle, X } from 'lucide-react';
import { useHeadlessTable, useHeadlessSearch, useHeadlessPagination } from '../../components/headless';
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
function ActionMenu({ company, onDeactivate, onView }) {
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
                    {company.status === 'active' && (
                        <button
                            onClick={() => { onDeactivate(company); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                        >
                            <Ban className="w-4 h-4" />
                            Deactivate
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Mobile Company Card Component
function CompanyCard({ company, onDeactivate, onView, actionLoading }) {
    return (
        <div className="glass-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white font-medium text-lg">
                        {company.name.charAt(0)}
                    </div>
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
                        onView={onView}
                    />
                )}
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                    <MapPin className="w-4 h-4 text-dark-500 flex-shrink-0" />
                    <span>{company.city}, {company.country}</span>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                    <Briefcase className="w-4 h-4 text-dark-500 flex-shrink-0" />
                    <span>{company.jobPostCount} job posts</span>
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
        try {
            const response = await AdminService.getCompanies({
                page: currentPage,
                limit: pageSize,
                search: debouncedQuery,
            });

            setCompanies(response.data || []);
            setTotalItems(response.total || 0);
            setPaginationTotal(response.total || 0);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedQuery, setPaginationTotal]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleDeactivate = async (company) => {
        if (!window.confirm(`Are you sure you want to deactivate ${company.name}?`)) {
            return;
        }

        setActionLoading(company.id);
        try {
            await AdminService.deactivateCompany(company.id);
            fetchCompanies();
        } catch (error) {
            console.error('Failed to deactivate company:', error);
            alert('Company management requires Job Manager integration');
        } finally {
            setActionLoading(null);
        }
    };

    const handleView = (company) => {
        alert(`Company: ${company.name}\nIndustry: ${company.industry}\nLocation: ${company.city}, ${company.country}\nJob Posts: ${company.jobPostCount}`);
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

            {/* Job Manager Notice */}
            <div className="glass-card p-4 border-l-4 border-pink-400/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-white font-medium text-sm">Company data from Job Manager</p>
                    <p className="text-dark-400 text-xs sm:text-sm mt-1">
                        Companies are managed by the Job Manager subsystem. Full integration coming soon.
                    </p>
                </div>
            </div>

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
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white font-medium">
                                                    {company.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{company.name}</p>
                                                    <p className="text-sm text-dark-400">{company.email}</p>
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
        </div>
    );
}
