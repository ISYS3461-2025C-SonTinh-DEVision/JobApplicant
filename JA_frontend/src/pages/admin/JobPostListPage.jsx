/**
 * Job Post List Page
 * Admin page for viewing and managing job posts
 * 
 * Uses: useHeadlessTable, useHeadlessSearch, useHeadlessPagination
 * Requirement 6.2.2: View, search, and delete job posts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Briefcase, MapPin, Clock, MoreVertical, Trash2, Eye, Loader2, RefreshCw, Building2, DollarSign, Tag } from 'lucide-react';
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

// Action Menu Component
function ActionMenu({ jobPost, onDelete, onView }) {
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
                            onClick={() => { onView(jobPost); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5"
                        >
                            <Eye className="w-4 h-4" />
                            View Details
                        </button>
                        <button
                            onClick={() => { onDelete(jobPost); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </>
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
                <h3 className="text-xl font-bold text-white mb-2">Delete Job Post</h3>
                <p className="text-dark-400 mb-6">
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

export default function JobPostListPage() {
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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
        data: jobPosts,
        defaultSortKey: 'postedAt',
        defaultDirection: 'desc',
    });

    // Fetch job posts
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

    // Handle delete
    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleteLoading(true);
        try {
            await AdminService.deleteJobPost(deleteTarget.id);
            setDeleteTarget(null);
            fetchJobPosts();
        } catch (error) {
            console.error('Failed to delete job post:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Handle view
    const handleView = (jobPost) => {
        alert(`Title: ${jobPost.title}\nCompany: ${jobPost.company}\nLocation: ${jobPost.location}\nSalary: ${jobPost.salary}\nType: ${jobPost.type}\n\nDescription: ${jobPost.description}`);
    };

    // Table columns
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
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Briefcase className="w-7 h-7 text-blue-400" />
                        Job Posts
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Manage job listings • {totalItems} total
                    </p>
                </div>
                <button
                    onClick={fetchJobPosts}
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
                        placeholder="Search by title, company, or description..."
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
                                        No job posts found
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
