/**
 * Company List Page
 * Admin page for viewing and managing companies
 * 
 * Uses: useHeadlessTable, useHeadlessSearch, useHeadlessPagination
 * Requirement 6.1.2, 6.2.1: View, search, and deactivate companies
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Building2, Crown, MapPin, Mail, MoreVertical, Ban, Eye, Loader2, RefreshCw, Briefcase } from 'lucide-react';
import { useHeadlessTable, useHeadlessSearch, useHeadlessPagination } from '../../components/headless';
import AdminService from '../../services/AdminService';

// Status Badge Component
function StatusBadge({ status, isPremium }) {
    return (
        <div className="flex items-center gap-2">
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

// Action Menu Component
function ActionMenu({ company, onDeactivate, onView }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
                <MoreVertical className="w-4 h-4 text-dark-400" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-40 bg-dark-800 border border-white/10 rounded-xl shadow-xl z-20 py-1 animate-fade-in">
                        <button
                            onClick={() => { onView(company); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5"
                        >
                            <Eye className="w-4 h-4" />
                            View Details
                        </button>
                        {company.status === 'active' && (
                            <button
                                onClick={() => { onDeactivate(company); setIsOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                            >
                                <Ban className="w-4 h-4" />
                                Deactivate
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default function CompanyListPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);

    // Headless search hook
    const {
        query: searchQuery,
        setQuery: setSearchQuery,
        debouncedQuery,
    } = useHeadlessSearch({
        debounceMs: 300,
    });

    // Headless pagination hook
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

    // Headless table hook
    const {
        sortKey,
        direction,
        toggleSort,
        sortedData,
        getSortIcon,
    } = useHeadlessTable({
        data: companies,
        defaultSortKey: 'name',
        defaultDirection: 'asc',
    });

    // Fetch companies
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

    // Handle deactivate
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
        } finally {
            setActionLoading(null);
        }
    };

    // Handle view
    const handleView = (company) => {
        alert(`Company: ${company.name}\nIndustry: ${company.industry}\nLocation: ${company.city}, ${company.country}\nJob Posts: ${company.jobPostCount}`);
    };

    // Table columns
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
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Building2 className="w-7 h-7 text-pink-400" />
                        Companies
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Manage registered companies • {totalItems} total
                    </p>
                </div>
                <button
                    onClick={fetchCompanies}
                    className="btn-secondary flex items-center gap-2"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
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
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
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
                                        No companies found
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
                    <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
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
        </div>
    );
}
