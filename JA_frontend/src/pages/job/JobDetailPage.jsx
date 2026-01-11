/**
 * Job Detail Page
 * Displays full details of a specific job posting.
 * 
 * Requirements covered:
 * - 4.1.4: Display job details with Posted Date, Expiry Date, Job Description
 * - 4.2.3 & 4.3.2: Apply with Cover Letter and CV upload (via ApplicationModal)
 * - 4.2.6: Display Skill Tags
 * 
 * Architecture: Uses Headless Card for data display (Ultimo A.3.a)
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Briefcase, DollarSign, Clock, Building2,
    Share2, Bookmark, Calendar, AlertTriangle, Users, GraduationCap,
    CheckCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import JobSearchService from '../../services/JobSearchService';
import ApplicationModal from '../../components/job/ApplicationModal';
import { formatDate, formatSalary } from '../../utils/JobHelpers';
import { Tag } from '../../components/reusable';
import { Card, useCard } from '../../components/headless';

/**
 * Job Info Card - Headless UI pattern
 * Uses Card component for consistent interaction handling
 */
const JobInfoCard = ({ job, isDark, onApply, isExpired }) => {
    const cardController = useCard({
        item: job,
        onAction: isExpired ? null : onApply,
    });

    return (
        <Card
            item={job}
            onAction={isExpired ? null : onApply}
            className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${cardController.isHovered && !isExpired ? 'shadow-xl' : 'shadow-lg'
                } ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}
        >
            {({ isHovered, getCardProps }) => (
                <div {...getCardProps()}>
                    {/* Header with gradient accent */}
                    <div className={`relative p-6 pb-4 ${isDark ? 'bg-gradient-to-r from-dark-800 via-dark-800 to-primary-900/20' : 'bg-gradient-to-r from-white via-white to-primary-50'}`}>
                        {/* Expired overlay */}
                        {isExpired && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                                    <AlertTriangle className="w-4 h-4" />
                                    This job has expired
                                </div>
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {job.title}
                                </h1>
                                <div className={`flex items-center gap-2 text-lg ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                    <Building2 className="w-5 h-5 text-primary-500" />
                                    <span className="font-medium">{job.company}</span>
                                </div>
                            </div>

                            {/* Company Logo */}
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl font-bold shadow-lg ${isDark
                                ? 'bg-gradient-to-br from-primary-500 to-violet-500 text-white'
                                : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'
                                }`}>
                                {job.companyLogo ? (
                                    <img src={job.companyLogo} alt={job.company} className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    job.company?.charAt(0) || '?'
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                        {/* Location - Requirement 4.1.4 */}
                        <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
                            <MapPin className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                            <div>
                                <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Location</p>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.location}</p>
                            </div>
                        </div>

                        {/* Employment Type - Requirement 4.1.4 */}
                        <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
                            <Briefcase className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                            <div>
                                <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Type</p>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.employmentType}</p>
                            </div>
                        </div>

                        {/* Salary - Requirement 4.1.4 */}
                        <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-dark-700/50 border border-green-500/20' : 'bg-green-50'}`}>
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <div>
                                <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Salary</p>
                                <p className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{formatSalary(job.salary)}</p>
                            </div>
                        </div>

                        {/* Posted Date - Requirement 4.1.4 */}
                        <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
                            <Clock className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                            <div>
                                <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Posted</p>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(job.postedAt)}</p>
                            </div>
                        </div>

                        {/* Expiry Date - Requirement 4.1.4 */}
                        {job.expiresAt && (
                            <div className={`flex items-center gap-2 p-3 rounded-xl ${isExpired
                                ? (isDark ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200')
                                : (isDark ? 'bg-dark-700/50' : 'bg-gray-50')
                                }`}>
                                <Calendar className={`w-5 h-5 ${isExpired ? 'text-red-500' : (isDark ? 'text-cyan-400' : 'text-cyan-500')}`} />
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Expires</p>
                                    <p className={`text-sm font-medium ${isExpired ? 'text-red-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                                        {formatDate(job.expiresAt)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Fresher Badge - Requirement 4.2.2 */}
                        {job.fresher && !isExpired && (
                            <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-emerald-900/20 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                                <GraduationCap className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Level</p>
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Fresher Welcome</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

/**
 * Main Job Detail Page Component
 */
const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark } = useTheme();

    // Get job data passed from list (preserves company info)
    const jobFromState = location.state?.job;

    const [job, setJob] = useState(jobFromState || null);
    const [loading, setLoading] = useState(!jobFromState); // Skip loading if we have state data
    const [error, setError] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Application Modal state
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    // Fetch job data and merge with state data to preserve company info
    const fetchJob = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await JobSearchService.getJobById(id);

            // Merge API response with state data to preserve company info
            // API may not return company fields, but we have them from the list
            if (data && jobFromState) {
                setJob({
                    ...data,
                    // Preserve company info from list if API doesn't return it
                    company: data.company && data.company !== 'Unknown Company'
                        ? data.company
                        : jobFromState.company,
                    companyName: data.companyName || jobFromState.companyName,
                    companyId: data.companyId || jobFromState.companyId,
                    companyLogo: data.companyLogo || jobFromState.companyLogo,
                });
            } else {
                setJob(data);
            }
        } catch (err) {
            // If API fails but we have state data, use that
            if (jobFromState) {
                setJob(jobFromState);
            } else {
                setError('Failed to load job details. Please try again.');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    }, [id, jobFromState]);

    useEffect(() => {
        if (id) {
            // If we already have job data from state, show it immediately
            // but still fetch fresh data in background
            if (jobFromState) {
                setJob(jobFromState);
                setLoading(false);
                // Fetch fresh data in background to update any changes
                fetchJob();
            } else {
                fetchJob();
            }
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle apply
    const handleApply = useCallback(() => {
        setIsApplicationModalOpen(true);
    }, []);

    // Handle successful application
    const handleApplicationSuccess = useCallback(() => {
        console.log('Application submitted successfully for job:', id);
    }, [id]);

    // Handle bookmark
    const handleBookmark = useCallback(() => {
        setIsBookmarked(prev => !prev);
    }, []);

    // Handle share
    const handleShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: job?.title,
                    text: `Check out this job: ${job?.title} at ${job?.company}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            // Could show a toast here
        }
    }, [job]);

    // Check if job is expired
    const isExpired = job?.expiresAt && new Date(job.expiresAt) < new Date();

    // Loading State
    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDark ? 'bg-dark-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary-200 dark:border-dark-700"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                </div>
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Loading job details...</p>
            </div>
        );
    }

    // Error State
    if (error || !job) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${isDark ? 'bg-dark-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className={`p-6 rounded-2xl border text-center max-w-md ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {error ? 'Something went wrong' : 'Job not found'}
                    </h2>
                    <p className={`text-sm mb-6 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        {error || 'This job may have been removed or does not exist.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate('/dashboard/jobs')}
                            className={`px-4 py-2 rounded-xl font-medium transition-colors ${isDark ? 'bg-dark-700 text-dark-300 hover:bg-dark-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Back to Jobs
                        </button>
                        {error && (
                            <button
                                onClick={fetchJob}
                                className="px-4 py-2 rounded-xl font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
            {/* Header / Nav */}
            <div className={`sticky top-0 z-20 border-b backdrop-blur-lg ${isDark ? 'bg-dark-800/90 border-dark-700' : 'bg-white/90 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                            title="Share job"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleBookmark}
                            className={`p-2 rounded-xl transition-colors ${isBookmarked
                                ? 'bg-primary-500/20 text-primary-500'
                                : (isDark ? 'hover:bg-dark-700 text-dark-300' : 'hover:bg-gray-100 text-gray-600')
                                }`}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                        >
                            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6 animate-fade-in">
                        {/* Job Info Card - Using Headless Card */}
                        <JobInfoCard
                            job={job}
                            isDark={isDark}
                            onApply={handleApply}
                            isExpired={isExpired}
                        />

                        {/* Job Description - Requirement 4.1.4 */}
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <CheckCircle className="w-5 h-5 text-primary-500" />
                                Job Description
                            </h3>
                            <div className={`prose max-w-none leading-relaxed ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                <p className="whitespace-pre-line">{job.description}</p>
                            </div>
                        </div>

                        {/* Requirements Section */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    <CheckCircle className="w-5 h-5 text-primary-500" />
                                    Requirements
                                </h3>
                                <ul className="space-y-3">
                                    {job.requirements.map((req, i) => (
                                        <li key={i} className={`flex items-start gap-3 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-100 text-primary-600'}`}>
                                                {i + 1}
                                            </span>
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Benefits Section (if available) */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    Benefits
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {job.benefits.map((benefit, i) => (
                                        <div key={i} className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-green-50'}`}>
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-24 space-y-6`}>
                            {/* Apply Card */}
                            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                                <button
                                    onClick={handleApply}
                                    disabled={isExpired}
                                    className={`w-full py-4 px-6 font-semibold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${isExpired
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {isExpired ? (
                                        <>
                                            <AlertTriangle className="w-5 h-5" />
                                            Job Expired
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink className="w-5 h-5" />
                                            Apply Now
                                        </>
                                    )}
                                </button>

                                {!isExpired && (
                                    <p className={`text-xs text-center mt-3 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                        Easy apply with your profile
                                    </p>
                                )}
                            </div>

                            {/* Skills Card - Requirement 4.2.6 */}
                            {job.skills && job.skills.length > 0 && (
                                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                                    <h4 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <Users className="w-4 h-4 text-primary-500" />
                                        Skills Required
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, index) => (
                                            <Tag
                                                key={index}
                                                label={skill}
                                                variant={isDark ? 'primary' : 'default'}
                                                className="animate-fade-in"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Company Info Card */}
                            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                                <h4 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    <Building2 className="w-4 h-4 text-primary-500" />
                                    About {job.company}
                                </h4>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${isDark ? 'bg-gradient-to-br from-primary-500 to-violet-500 text-white' : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'}`}>
                                        {job.company?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.company}</p>
                                        <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{job.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Application Modal - Requirements 4.2.3 & 4.3.2 */}
            <ApplicationModal
                isOpen={isApplicationModalOpen}
                onClose={() => setIsApplicationModalOpen(false)}
                job={job}
                onSuccess={handleApplicationSuccess}
            />
        </div>
    );
};

export default JobDetailPage;
