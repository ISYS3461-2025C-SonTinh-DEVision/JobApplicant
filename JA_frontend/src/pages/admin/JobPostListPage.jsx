/**
 * Job Post List Page
 * Admin page for viewing and managing job posts
 * 
 * Note: Job posts come from Job Manager subsystem
 * Uses: useHeadlessTable, useHeadlessSearch, useHeadlessPagination
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Briefcase, MapPin, Clock, MoreVertical, Trash2, Eye, Loader2, RefreshCw, Building2, DollarSign, AlertCircle, X } from 'lucide-react';
import { useHeadlessTable, useHeadlessSearch, useHeadlessPagination } from '../../components/headless';
import AdminService from '../../services/AdminService';

// Status Badge Component
function JobStatusBadge({ status }) {
    const styles = {
        active: 'bg-emerald-500/20 text-emerald-400',
        expired: 'bg-red-500/20 text-red-400',
        draft: 'bg-yellow-500/20 text-yellow-400',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
            {status}
        </span>
    );
}

// Employment Type Badge
function TypeBadge({ type }) {
    const styles = {
        'Full-time': 'bg-blue-500/20 text-blue-400',
        'Part-time': 'bg-purple-500/20 text-purple-400',
        'Internship': 'bg-pink-500/20 text-pink-400',
        'Contract': 'bg-orange-500/20 text-orange-400',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-500/20 text-gray-400'}`}>
            {type}
        </span>
    );
}

// Action Menu Component - Fixed positioning
function ActionMenu({ jobPost, onDelete, onView }) {
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
                        onClick={() => { onView(jobPost); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>
                    <button
                        onClick={() => { onDelete(jobPost); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// Delete Confirmation Modal
function DeleteModal({ jobPost, onConfirm, onCancel, isLoading }) {
    if (!jobPost) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-scale-in">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Delete Job Post</h3>
                <p className="text-dark-400 mb-6 text-sm sm:text-base">
                    Are you sure you want to delete "<span className="text-white">{jobPost.title}</span>"?
                    This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Mobile Job Card Component
function JobCard({ job, onDelete, onView }) {
    return (
        <div className="glass-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{job.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-3 h-3 text-dark-500 flex-shrink-0" />
                        <span className="text-sm text-dark-400 truncate">{job.company}</span>
                    </div>
                </div>
                <ActionMenu
                    jobPost={job}
                    onDelete={() => onDelete(job)}
                    onView={onView}
                />
            </div>

            <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">{job.salary}</span>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                    <MapPin className="w-4 h-4 text-dark-500 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <TypeBadge type={job.type} />
                    <JobStatusBadge status={job.status} />
                </div>
                <div className="flex items-center gap-1 text-dark-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}

export default function JobPostListPage() {
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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
        data: jobPosts,
        defaultSortKey: 'postedAt',
        defaultDirection: 'desc',
    });

    const fetchJobPosts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminService.getJobPosts({
                page: currentPage,
                limit: pageSize,
                search: debouncedQuery,
            });

            setJobPosts(response.data || []);
            setTotalItems(response.total || 0);
            setPaginationTotal(response.total || 0);
        } catch (error) {
            console.error('Failed to fetch job posts:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedQuery, setPaginationTotal]);

    useEffect(() => {
        fetchJobPosts();
    }, [fetchJobPosts]);

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleteLoading(true);
        try {
            await AdminService.deleteJobPost(deleteTarget.id);
            setDeleteTarget(null);
            fetchJobPosts();
        } catch (error) {
            console.error('Failed to delete job post:', error);
            alert('Job post management requires Job Manager integration');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleView = (jobPost) => {
        alert(`Title: ${jobPost.title}\nCompany: ${jobPost.company}\nLocation: ${jobPost.location}\nSalary: ${jobPost.salary}\nType: ${jobPost.type}\n\nDescription: ${jobPost.description}`);
    };

    const columns = [
        { key: 'title', label: 'Job Title', sortable: true },
        { key: 'company', label: 'Company', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'postedAt', label: 'Posted', sortable: true },
        { key: 'actions', label: '', sortable: false },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        <Briefcase className="w-6 sm:w-7 h-6 sm:h-7 text-blue-400" />
                        Job Posts
                    </h1>
                    <p className="text-dark-400 mt-1 text-sm sm:text-base">
                        Manage job listings • {totalItems} total
                    </p>
                </div>
                <button
                    onClick={fetchJobPosts}
                    className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Job Manager Notice - Dynamic based on data source */}
            {totalItems > 0 ? (
                <div className="glass-card p-4 border-l-4 border-emerald-400/50 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-medium text-sm">Connected to Job Manager ✓</p>
                        <p className="text-dark-400 text-xs sm:text-sm mt-1">
                            Displaying real-time job post data from the Job Manager subsystem.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-4 border-l-4 border-blue-400/50 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-medium text-sm">Connecting to Job Manager...</p>
                        <p className="text-dark-400 text-xs sm:text-sm mt-1">
                            Loading job posts from the Job Manager subsystem.
                        </p>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search by title, company, or description..."
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
                        <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
                        <p className="text-dark-400 mt-2">Loading job posts...</p>
                    </div>
                ) : sortedData.length === 0 ? (
                    <div className="glass-card p-12 text-center text-dark-400">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No job posts found</p>
                        <p className="text-xs mt-2">Job posts will appear here once Job Manager is integrated</p>
                    </div>
                ) : (
                    sortedData.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onDelete={setDeleteTarget}
                            onView={handleView}
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
                                                <span className="text-blue-400">
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
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
                                        <p className="text-dark-400 mt-2">Loading job posts...</p>
                                    </td>
                                </tr>
                            ) : sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-dark-400">
                                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No job posts found</p>
                                        <p className="text-xs mt-2">Job posts will appear here once Job Manager is integrated</p>
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((job) => (
                                    <tr
                                        key={job.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-white">{job.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <DollarSign className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-sm text-emerald-400">{job.salary}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-dark-300">
                                                <Building2 className="w-4 h-4 text-dark-500" />
                                                {job.company}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-dark-300">
                                                <MapPin className="w-4 h-4 text-dark-500" />
                                                {job.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <TypeBadge type={job.type} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <JobStatusBadge status={job.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-dark-400 text-sm">
                                                <Clock className="w-4 h-4" />
                                                {new Date(job.postedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <ActionMenu
                                                jobPost={job}
                                                onDelete={() => setDeleteTarget(job)}
                                                onView={handleView}
                                            />
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

            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteModal
                    jobPost={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    isLoading={deleteLoading}
                />
            )}
        </div>
    );
}
