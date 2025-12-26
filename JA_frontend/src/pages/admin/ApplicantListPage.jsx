/**
 * Applicant List Page
 * Admin page for viewing and managing applicants
 * 
 * Uses: useHeadlessTable, useHeadlessSearch, useHeadlessPagination, useHeadlessModal
 * Requirement 6.1.2, 6.2.1: View, search, and deactivate applicants
 * 
 * Architecture: Ultimo Frontend - Componentized with Headless UI patterns
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Users, Crown, MapPin, Mail, MoreVertical, UserX, Eye, Loader2,
    RefreshCw, X, Phone, Briefcase, GraduationCap, Code, Calendar,
    AlertTriangle, CheckCircle
} from 'lucide-react';
import { useHeadlessTable, useHeadlessSearch, useHeadlessPagination, useHeadlessModal } from '../../components/headless';
import AdminService from '../../services/AdminService';

// ============================================
// MODAL COMPONENTS (Headless UI Pattern)
// ============================================

/**
 * Base Modal Wrapper Component
 * Provides consistent modal structure with backdrop and animations
 */
function ModalWrapper({ isOpen, onClose, children, size = 'md' }) {
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />
            {/* Modal Content */}
            <div className={`relative bg-dark-800 border border-white/10 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} animate-scale-in overflow-hidden`}>
                {children}
            </div>
        </div>
    );
}

/**
 * View Profile Modal Component
 * Displays detailed applicant information in a beautiful modal
 */
function ViewProfileModal({ isOpen, onClose, applicant }) {
    if (!applicant) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} size="lg">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-violet-600/20 to-pink-600/20 px-6 py-8 border-b border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-dark-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {applicant.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{applicant.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${applicant.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                {applicant.status}
                            </span>
                            {applicant.isPremium && (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                                    <Crown className="w-3 h-3" />
                                    Premium
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Contact Info */}
                <section>
                    <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3">
                        Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <Mail className="w-5 h-5 text-violet-400" />
                            <div>
                                <p className="text-xs text-dark-500">Email</p>
                                <p className="text-white text-sm">{applicant.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <MapPin className="w-5 h-5 text-pink-400" />
                            <div>
                                <p className="text-xs text-dark-500">Location</p>
                                <p className="text-white text-sm">{applicant.city}, {applicant.country}</p>
                            </div>
                        </div>
                        {applicant.phone && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                <Phone className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-xs text-dark-500">Phone</p>
                                    <p className="text-white text-sm">{applicant.phone}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                            <div>
                                <p className="text-xs text-dark-500">Member Since</p>
                                <p className="text-white text-sm">
                                    {new Date(applicant.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Skills */}
                {applicant.skills && applicant.skills.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Technical Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {applicant.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-sm font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Work Experience */}
                {applicant.workExperience && applicant.workExperience.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Work Experience
                        </h3>
                        <div className="space-y-3">
                            {applicant.workExperience.map((exp, index) => (
                                <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white font-medium">{exp.position}</p>
                                    <p className="text-dark-400 text-sm">{exp.company}</p>
                                    <p className="text-dark-500 text-xs mt-1">
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {applicant.education && applicant.education.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Education
                        </h3>
                        <div className="space-y-3">
                            {applicant.education.map((edu, index) => (
                                <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white font-medium">{edu.degree}</p>
                                    <p className="text-dark-400 text-sm">{edu.institution}</p>
                                    {edu.gpa && (
                                        <p className="text-dark-500 text-xs mt-1">GPA: {edu.gpa}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
                >
                    Close
                </button>
            </div>
        </ModalWrapper>
    );
}

/**
 * Deactivate Confirmation Modal Component
 * Confirms applicant deactivation with warning message
 */
function DeactivateConfirmModal({ isOpen, onClose, onConfirm, applicant, isLoading }) {
    if (!applicant) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} size="md">
            <div className="p-6">
                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                        Deactivate Account?
                    </h3>
                    <p className="text-dark-400">
                        Are you sure you want to deactivate the account for
                    </p>
                    <p className="text-white font-semibold mt-2">
                        {applicant.name}
                    </p>
                    <p className="text-dark-500 text-sm mt-1">
                        {applicant.email}
                    </p>
                </div>

                {/* Warning Info */}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                    <p className="text-red-400 text-sm text-center">
                        This will prevent the user from logging in and accessing their account.
                        The action can be reversed later.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deactivating...
                            </>
                        ) : (
                            <>
                                <UserX className="w-4 h-4" />
                                Deactivate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
}

/**
 * Success Toast Component
 * Shows success message after action completion
 */
function SuccessToast({ isVisible, message, onClose }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-2xl">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{message}</span>
                <button onClick={onClose} className="ml-2 hover:text-emerald-300">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ============================================
// STATUS BADGE COMPONENT
// ============================================

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

// ============================================
// ACTION MENU COMPONENT
// ============================================

function ActionMenu({ applicant, onDeactivate, onView }) {
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

// ============================================
// MOBILE APPLICANT CARD COMPONENT
// ============================================

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

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ApplicantListPage() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [successToast, setSuccessToast] = useState({ isVisible: false, message: '' });

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

    // Handle view profile - opens modal
    const handleView = (applicant) => {
        setSelectedApplicant(applicant);
        setViewModalOpen(true);
    };

    // Handle deactivate - opens confirmation modal
    const handleDeactivateClick = (applicant) => {
        setSelectedApplicant(applicant);
        setDeactivateModalOpen(true);
    };

    // Confirm deactivation
    const handleDeactivateConfirm = async () => {
        if (!selectedApplicant) return;

        setActionLoading(selectedApplicant.id);
        try {
            await AdminService.deactivateApplicant(selectedApplicant.id);
            setDeactivateModalOpen(false);
            setSuccessToast({
                isVisible: true,
                message: `${selectedApplicant.name} has been deactivated`
            });
            fetchApplicants();
        } catch (error) {
            console.error('Failed to deactivate applicant:', error);
        } finally {
            setActionLoading(null);
            setSelectedApplicant(null);
        }
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
                            onDeactivate={handleDeactivateClick}
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
                                                    onDeactivate={handleDeactivateClick}
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

            {/* View Profile Modal */}
            <ViewProfileModal
                isOpen={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedApplicant(null);
                }}
                applicant={selectedApplicant}
            />

            {/* Deactivate Confirmation Modal */}
            <DeactivateConfirmModal
                isOpen={deactivateModalOpen}
                onClose={() => {
                    setDeactivateModalOpen(false);
                    setSelectedApplicant(null);
                }}
                onConfirm={handleDeactivateConfirm}
                applicant={selectedApplicant}
                isLoading={actionLoading === selectedApplicant?.id}
            />

            {/* Success Toast */}
            <SuccessToast
                isVisible={successToast.isVisible}
                message={successToast.message}
                onClose={() => setSuccessToast({ isVisible: false, message: '' })}
            />
        </div>
    );
}
