/**
 * Job Match List Page
 * 
 * Displays matched jobs for the current user based on their search profile.
 * Available for ALL users (FREEMIUM and PREMIUM).
 * 
 * Architecture: A.2.b - Componentized Frontend + A.3.a Headless UI
 * 
 * Uses:
 * - useHeadlessDataList: Data fetching, search, and actions
 * - useHeadlessPagination: Page navigation
 * - useCard: Card interactions
 * - useModal: Job details modal
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles, Briefcase, MapPin, Clock, DollarSign, Search,
    RefreshCw, Target, TrendingUp, CheckCircle2, Eye, ChevronRight,
    AlertCircle, ArrowRight, Zap, Award, Calendar, ExternalLink
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import {
    useHeadlessPagination,
    useModal,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useCard,
} from '../../components/headless';

import JobMatchService from '../../services/JobMatchService';

// ===== Constants =====
const ITEMS_PER_PAGE = 6;

// ===== Match Score Badge Component =====
function MatchScoreBadge({ score, size = 'md', isDark }) {
    const getScoreColor = () => {
        if (score >= 80) return 'from-emerald-500 to-green-500';
        if (score >= 60) return 'from-blue-500 to-primary-500';
        if (score >= 40) return 'from-amber-500 to-orange-500';
        return 'from-gray-500 to-gray-600';
    };

    const sizes = {
        sm: 'w-12 h-12 text-sm',
        md: 'w-16 h-16 text-lg',
        lg: 'w-20 h-20 text-xl',
    };

    return (
        <div className={`
      ${sizes[size]} rounded-full flex items-center justify-center
      bg-gradient-to-br ${getScoreColor()}
      shadow-lg text-white font-bold
    `}>
            {Math.round(score)}%
        </div>
    );
}

// ===== Score Breakdown Bar =====
function ScoreBreakdownBar({ label, score, weight, isDark }) {
    const percentage = Math.min(100, Math.max(0, score));

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className={isDark ? 'text-dark-400' : 'text-gray-500'}>
                    {label} ({weight}%)
                </span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {Math.round(score)}%
                </span>
            </div>
            <div className={`h-2 rounded-full ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' :
                        score >= 60 ? 'bg-blue-500' :
                            score >= 40 ? 'bg-amber-500' : 'bg-gray-400'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// ===== Job Match Card Component =====
function JobMatchCard({ match, onView, onApply, isDark }) {
    const { expanded, toggleExpand, getCardProps } = useCard({
        item: match,
        onView,
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const formatSalary = () => {
        if (!match.salaryMin && !match.salaryMax) return 'Not specified';
        const currency = match.salaryCurrency || 'USD';
        if (match.salaryMin && match.salaryMax) {
            return `${currency} ${match.salaryMin.toLocaleString()} - ${match.salaryMax.toLocaleString()}`;
        }
        if (match.salaryMin) return `${currency} ${match.salaryMin.toLocaleString()}+`;
        return `Up to ${currency} ${match.salaryMax.toLocaleString()}`;
    };

    return (
        <div
            {...getCardProps()}
            className={`
        group relative rounded-2xl overflow-hidden transition-all duration-300
        ${isDark
                    ? 'bg-dark-800 border border-dark-700 hover:border-primary-500/50'
                    : 'bg-white border border-gray-200 hover:border-primary-400'
                }
        hover:shadow-xl hover:-translate-y-1
        ${!match.isViewed ? 'ring-2 ring-primary-500/30' : ''}
      `}
        >
            {/* New Badge */}
            {!match.isViewed && (
                <div className="absolute top-4 right-4 z-10">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-500 text-white animate-pulse">
                        NEW
                    </span>
                </div>
            )}

            <div className="p-6">
                {/* Header with Match Score */}
                <div className="flex items-start gap-4">
                    <MatchScoreBadge score={match.matchScore} size="md" isDark={isDark} />

                    <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {match.jobTitle}
                        </h3>

                        <div className={`flex items-center gap-2 mt-1 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{match.location || 'Remote'}</span>
                        </div>

                        <div className={`flex items-center gap-2 mt-1 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            <span>{formatSalary()}</span>
                        </div>
                    </div>
                </div>

                {/* Employment Types */}
                {match.employmentTypes && match.employmentTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {match.employmentTypes.map((type, idx) => (
                            <span
                                key={idx}
                                className={`
                  px-2 py-1 text-xs font-medium rounded-lg
                  ${isDark
                                        ? 'bg-dark-700 text-dark-300'
                                        : 'bg-gray-100 text-gray-600'
                                    }
                `}
                            >
                                {type.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                )}

                {/* Matched Skills */}
                {match.matchedSkills && match.matchedSkills.length > 0 && (
                    <div className="mt-4">
                        <p className={`text-xs font-medium mb-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500" />
                            Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {match.matchedSkills.slice(0, 5).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className={`
                    px-2 py-0.5 text-xs font-medium rounded-full
                    ${isDark
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        }
                  `}
                                >
                                    {skill}
                                </span>
                            ))}
                            {match.matchedSkills.length > 5 && (
                                <span className={`px-2 py-0.5 text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                    +{match.matchedSkills.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Date Info */}
                <div className={`flex items-center gap-4 mt-4 text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Posted: {formatDate(match.postedDate)}</span>
                    </div>
                    {match.expiryDate && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Expires: {formatDate(match.expiryDate)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-dashed border-dark-700">
                    <button
                        onClick={() => onView(match)}
                        className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              font-medium text-sm transition-all
              ${isDark
                                ? 'bg-dark-700 text-white hover:bg-dark-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
            `}
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>
                    <button
                        onClick={() => onApply(match)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              font-medium text-sm transition-all
              bg-primary-600 text-white hover:bg-primary-500"
                    >
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ===== Job Details Modal =====
function JobDetailsModal({ match, isOpen, onClose, onApply, isDark }) {
    if (!match) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay className={isDark ? 'bg-black/70' : 'bg-black/50'} />
            <ModalContent className={`
        max-w-2xl mx-4 rounded-2xl overflow-hidden
        ${isDark ? 'bg-dark-800' : 'bg-white'}
      `}>
                <ModalHeader className={`
          px-6 py-4 border-b
          ${isDark ? 'border-dark-700' : 'border-gray-200'}
        `}>
                    <div className="flex items-center gap-4">
                        <MatchScoreBadge score={match.matchScore} size="md" isDark={isDark} />
                        <div>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {match.jobTitle}
                            </h2>
                            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                {match.location || 'Remote'}
                            </p>
                        </div>
                    </div>
                    <ModalCloseButton className={isDark ? 'text-dark-400 hover:text-white' : ''} />
                </ModalHeader>

                <ModalBody className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Score Breakdown */}
                    <div className={`
            p-4 rounded-xl mb-6
            ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}
          `}>
                        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <TrendingUp className="w-4 h-4 text-primary-500" />
                            Match Score Breakdown
                        </h3>
                        <div className="space-y-3">
                            <ScoreBreakdownBar label="Skills" score={match.skillsScore || 0} weight={30} isDark={isDark} />
                            <ScoreBreakdownBar label="Salary" score={match.salaryScore || 0} weight={25} isDark={isDark} />
                            <ScoreBreakdownBar label="Location" score={match.locationScore || 0} weight={20} isDark={isDark} />
                            <ScoreBreakdownBar label="Employment Type" score={match.employmentScore || 0} weight={15} isDark={isDark} />
                            <ScoreBreakdownBar label="Job Title" score={match.titleScore || 0} weight={10} isDark={isDark} />
                        </div>
                    </div>

                    {/* Description */}
                    {match.jobDescription && (
                        <div className="mb-6">
                            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Description
                            </h3>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                {match.jobDescription}
                            </p>
                        </div>
                    )}

                    {/* Required Skills */}
                    {match.requiredSkills && match.requiredSkills.length > 0 && (
                        <div className="mb-6">
                            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Required Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {match.requiredSkills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className={`
                      px-3 py-1 text-sm rounded-lg
                      ${match.matchedSkills?.includes(skill)
                                                ? isDark
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : isDark
                                                    ? 'bg-dark-700 text-dark-300'
                                                    : 'bg-gray-100 text-gray-600'
                                            }
                    `}
                                    >
                                        {match.matchedSkills?.includes(skill) && (
                                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                        )}
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </ModalBody>

                <ModalFooter className={`
          px-6 py-4 border-t flex gap-3
          ${isDark ? 'border-dark-700' : 'border-gray-200'}
        `}>
                    <button
                        onClick={onClose}
                        className={`
              flex-1 px-4 py-2.5 rounded-xl font-medium transition-all
              ${isDark
                                ? 'bg-dark-700 text-white hover:bg-dark-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
            `}
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onApply(match);
                            onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              font-medium transition-all bg-primary-600 text-white hover:bg-primary-500"
                    >
                        Apply Now
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// ===== Empty State Component =====
function EmptyState({ hasSearchProfile, onCreateProfile, onCheckMatches, loading, isDark }) {
    if (!hasSearchProfile) {
        return (
            <div className={`
        text-center py-16 px-8 rounded-2xl
        ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}
      `}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <Target className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    No Search Profile Yet
                </h3>
                <p className={`max-w-md mx-auto mb-6 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    Create your personalized job matching preferences to start receiving matched jobs automatically.
                </p>
                <button
                    onClick={onCreateProfile}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
            font-medium bg-primary-600 text-white hover:bg-primary-500 transition-all"
                >
                    <Sparkles className="w-5 h-5" />
                    Create Search Profile
                </button>
            </div>
        );
    }

    return (
        <div className={`
      text-center py-16 px-8 rounded-2xl
      ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}
    `}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No Matched Jobs Yet
            </h3>
            <p className={`max-w-md mx-auto mb-6 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                We'll notify you when new jobs matching your preferences are posted. You can also check for new matches manually.
            </p>
            <button
                onClick={onCheckMatches}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
          font-medium bg-primary-600 text-white hover:bg-primary-500 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Checking...
                    </>
                ) : (
                    <>
                        <RefreshCw className="w-5 h-5" />
                        Check for New Matches
                    </>
                )}
            </button>
        </div>
    );
}

// ===== Main Component =====
export default function JobMatchListPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [hasSearchProfile, setHasSearchProfile] = useState(true);
    const [checkingMatches, setCheckingMatches] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const hasFetched = React.useRef(false);

    // Modal for job details
    const detailsModal = useModal();

    // Fetch matched jobs on mount (only once)
    React.useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchMatchedJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                const matches = await JobMatchService.getMyMatchedJobs();
                setMatchedJobs(matches || []);
                setHasSearchProfile(true);
            } catch (err) {
                console.error('[JobMatchListPage] Error fetching matched jobs:', err);
                if (err.response?.status === 204 || err.response?.status === 404) {
                    setHasSearchProfile(false);
                    setMatchedJobs([]);
                } else {
                    setError(err.message || 'Failed to fetch matched jobs');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMatchedJobs();
    }, []);

    // Filtered items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return matchedJobs;

        const query = searchQuery.toLowerCase();
        return matchedJobs.filter((item) =>
            (item.jobTitle && item.jobTitle.toLowerCase().includes(query)) ||
            (item.location && item.location.toLowerCase().includes(query)) ||
            (item.matchedSkills && item.matchedSkills.some(s => s.toLowerCase().includes(query)))
        );
    }, [matchedJobs, searchQuery]);

    // Pagination
    const pagination = useHeadlessPagination({
        totalItems: filteredItems.length,
        itemsPerPage: ITEMS_PER_PAGE,
        initialPage: 1,
    });

    // Paginated items
    const paginatedItems = useMemo(() => {
        const start = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredItems, pagination.currentPage]);

    // Handle view job details
    const handleView = useCallback((match) => {
        setSelectedMatch(match);
        detailsModal.open();
        // Mark as viewed
        if (!match.isViewed) {
            JobMatchService.markAsViewed(match.id).catch(console.error);
            setMatchedJobs(prev => prev.map(m => m.id === match.id ? { ...m, isViewed: true } : m));
        }
    }, [detailsModal]);

    // Check for new matches
    const handleCheckMatches = useCallback(async () => {
        setCheckingMatches(true);
        try {
            const newMatches = await JobMatchService.checkNewMatches();
            if (newMatches && newMatches.length > 0) {
                // Refetch all matched jobs
                const allMatches = await JobMatchService.getMyMatchedJobs();
                setMatchedJobs(allMatches || []);
            }
        } catch (err) {
            console.error('Error checking matches:', err);
        } finally {
            setCheckingMatches(false);
        }
    }, []);

    // Navigate to apply
    const handleApply = useCallback((match) => {
        navigate(`/dashboard/jobs?jobId=${match.jobPostId}`);
    }, [navigate]);

    // Navigate to create profile
    const handleCreateProfile = useCallback(() => {
        navigate('/dashboard/search-profile');
    }, [navigate]);

    // Stats
    const stats = useMemo(() => {
        return {
            total: matchedJobs.length,
            unviewed: matchedJobs.filter(m => !m.isViewed).length,
            avgScore: matchedJobs.length > 0
                ? Math.round(matchedJobs.reduce((sum, m) => sum + (m.matchScore || 0), 0) / matchedJobs.length)
                : 0,
        };
    }, [matchedJobs]);

    const isEmpty = filteredItems.length === 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Sparkles className="w-7 h-7 text-primary-500" />
                        Job Match Lists
                    </h1>
                    <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        Jobs matching your search profile preferences
                    </p>
                </div>

                <button
                    onClick={handleCheckMatches}
                    disabled={checkingMatches || loading}
                    className={`
            inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
            font-medium transition-all
            ${isDark
                            ? 'bg-dark-700 text-white hover:bg-dark-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                >
                    <RefreshCw className={`w-4 h-4 ${checkingMatches ? 'animate-spin' : ''}`} />
                    {checkingMatches ? 'Checking...' : 'Check New Matches'}
                </button>
            </div>

            {/* Stats Cards */}
            {stats.total > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`
            p-4 rounded-xl
            ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}
          `}>
                        <div className="flex items-center gap-3">
                            <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}
              `}>
                                <Briefcase className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.total}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                    Total Matches
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`
            p-4 rounded-xl
            ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}
          `}>
                        <div className="flex items-center gap-3">
                            <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${isDark ? 'bg-amber-500/20' : 'bg-amber-50'}
              `}>
                                <Zap className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.unviewed}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                    New Matches
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`
            p-4 rounded-xl
            ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}
          `}>
                        <div className="flex items-center gap-3">
                            <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}
              `}>
                                <Award className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.avgScore}%
                                </p>
                                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                    Avg Match Score
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            {stats.total > 0 && (
                <div className="relative">
                    <Search className={`
            absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
            ${isDark ? 'text-dark-400' : 'text-gray-400'}
          `} />
                    <input
                        type="text"
                        placeholder="Search by job title, location, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`
              w-full pl-12 pr-4 py-3 rounded-xl transition-all
              ${isDark
                                ? 'bg-dark-800 border border-dark-700 text-white placeholder:text-dark-400 focus:border-primary-500'
                                : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary-500'
                            }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
                    />
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className={`
          p-4 rounded-xl flex items-center gap-3
          ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}
        `}>
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && isEmpty && (
                <EmptyState
                    hasSearchProfile={hasSearchProfile}
                    onCreateProfile={handleCreateProfile}
                    onCheckMatches={handleCheckMatches}
                    loading={checkingMatches}
                    isDark={isDark}
                />
            )}

            {/* Job Match Grid */}
            {!loading && !isEmpty && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map((match) => (
                        <JobMatchCard
                            key={match.id}
                            match={match}
                            onView={handleView}
                            onApply={handleApply}
                            isDark={isDark}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={pagination.prevPage}
                        disabled={!pagination.hasPrev}
                        className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${isDark
                                ? 'bg-dark-700 text-white hover:bg-dark-600 disabled:opacity-50'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                            }
              disabled:cursor-not-allowed
            `}
                    >
                        Previous
                    </button>

                    <span className={`px-4 py-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={pagination.nextPage}
                        disabled={!pagination.hasNext}
                        className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${isDark
                                ? 'bg-dark-700 text-white hover:bg-dark-600 disabled:opacity-50'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                            }
              disabled:cursor-not-allowed
            `}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Job Details Modal */}
            <JobDetailsModal
                match={selectedMatch}
                isOpen={detailsModal.isOpen}
                onClose={detailsModal.close}
                onApply={handleApply}
                isDark={isDark}
            />
        </div>
    );
}
