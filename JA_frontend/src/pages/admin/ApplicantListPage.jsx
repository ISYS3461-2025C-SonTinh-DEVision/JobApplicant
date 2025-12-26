/**
 * Applicant List Page
 * Admin page for viewing and managing applicants
 * 
 * Uses: useHeadlessTable, useHeadlessSearch, useHeadlessPagination
 * Requirement 6.1.2, 6.2.1: View, search, and deactivate applicants
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Users, Crown, MapPin, Mail, MoreVertical, UserX, Eye, Loader2, RefreshCw, X } from 'lucide-react';
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
function ActionMenu({ applicant, onDeactivate, onView }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // Close on click outside
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
                        onClick={() => { onView(applicant); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10"
                    >
                        <Eye className="w-4 h-4" />
                        View Profile
                    </button>
                    {applicant.status === 'active' && (
                        <button
                            onClick={() => { onDeactivate(applicant); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                        >
                            <UserX className="w-4 h-4" />
                            Deactivate
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Mobile Applicant Card Component
function ApplicantCard({ applicant, onDeactivate, onView, actionLoading }) {
    return (
        <div className="glass-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-medium text-lg">
                        {applicant.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium text-white">{applicant.name}</p>
                        <p className="text-sm text-dark-400">
                            {applicant.skills?.slice(0, 2).join(', ')}
                        </p>
                    </div>
                </div>
                {actionLoading === applicant.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                ) : (
                    <ActionMenu
                        applicant={applicant}
                        onDeactivate={onDeactivate}
                        onView={onView}
                    />
                )}
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                    <Mail className="w-4 h-4 text-dark-500 flex-shrink-0" />
                    <span className="truncate">{applicant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                    <MapPin className="w-4 h-4 text-dark-500 flex-shrink-0" />
                    <span>{applicant.city}, {applicant.country}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <StatusBadge status={applicant.status} isPremium={applicant.isPremium} />
                <span className="text-dark-400 text-xs">
                    {new Date(applicant.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}

export default function ApplicantListPage() {
    const [applicants, setApplicants] = useState([]);
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
        goToPage,
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
        data: applicants,
        defaultSortKey: 'name',
        defaultDirection: 'asc',
    });

    // Fetch applicants
    const fetchApplicants = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminService.getApplicants({
                page: currentPage,
                limit: pageSize,
                search: debouncedQuery,
            });

            setApplicants(response.data || []);
            setTotalItems(response.total || 0);
            setPaginationTotal(response.total || 0);
        } catch (error) {
            console.error('Failed to fetch applicants:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedQuery, setPaginationTotal]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    // Handle deactivate
    const handleDeactivate = async (applicant) => {
        if (!window.confirm(`Are you sure you want to deactivate ${applicant.name}?`)) {
            return;
        }

        setActionLoading(applicant.id);
        try {
            await AdminService.deactivateApplicant(applicant.id);
            // Refresh list
            fetchApplicants();
        } catch (error) {
            console.error('Failed to deactivate applicant:', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Handle view profile
    const handleView = (applicant) => {
        // Could open a modal or navigate to profile
        alert(`View profile: ${applicant.name}\nEmail: ${applicant.email}\nCountry: ${applicant.country}`);
    };

    // Table columns
    const columns = [
        { key: 'name', label: 'Applicant', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'country', label: 'Location', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'createdAt', label: 'Joined', sortable: true },
        { key: 'actions', label: '', sortable: false },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="w-6 sm:w-7 h-6 sm:h-7 text-violet-400" />
                        Applicants
                    </h1>
                    <p className="text-dark-400 mt-1 text-sm sm:text-base">
                        Manage job applicants • {totalItems} total
                    </p>
                </div>
                <button
                    onClick={fetchApplicants}
                    className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
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
                        placeholder="Search by name or email..."
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
                        <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto" />
                        <p className="text-dark-400 mt-2">Loading applicants...</p>
                    </div>
                ) : sortedData.length === 0 ? (
                    <div className="glass-card p-12 text-center text-dark-400">
                        No applicants found
                    </div>
                ) : (
                    sortedData.map((applicant) => (
                        <ApplicantCard
                            key={applicant.id}
                            applicant={applicant}
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
                                                <span className="text-violet-400">
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
                                        <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto" />
                                        <p className="text-dark-400 mt-2">Loading applicants...</p>
                                    </td>
                                </tr>
                            ) : sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-dark-400">
                                        No applicants found
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((applicant) => (
                                    <tr
                                        key={applicant.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                                    {applicant.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{applicant.name}</p>
                                                    <p className="text-sm text-dark-400">
                                                        {applicant.skills?.slice(0, 2).join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-dark-300">
                                                <Mail className="w-4 h-4 text-dark-500" />
                                                {applicant.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-dark-300">
                                                <MapPin className="w-4 h-4 text-dark-500" />
                                                {applicant.city}, {applicant.country}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={applicant.status} isPremium={applicant.isPremium} />
                                        </td>
                                        <td className="px-6 py-4 text-dark-400 text-sm">
                                            {new Date(applicant.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {actionLoading === applicant.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                            ) : (
                                                <ActionMenu
                                                    applicant={applicant}
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
