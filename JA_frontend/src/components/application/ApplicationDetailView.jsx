/**
 * Application Detail View Component
 * 
 * Displays comprehensive application details with timeline and document management.
 * 
 * Requirements covered:
 * - 3.2.4: Display current and past job applications
 * - 4.1.4: Display job details (title, type, location, salary, company, dates)
 * 
 * Architecture: Uses Headless Card for data display (Ultimo A.3.a)
 */
import React, { useMemo } from 'react';
import {
    Building2, MapPin, Calendar, Clock, FileText, DollarSign,
    Download, ArrowLeft, ExternalLink, Briefcase, CheckCircle,
    AlertCircle, XCircle, Timer, RefreshCw, Tag
} from 'lucide-react';
import { Button } from '../reusable/Button';
import { formatDate, formatDateTime } from '../../utils/date';
import { useTheme } from '../../context/ThemeContext';
import { Card, useCard } from '../headless';

/**
 * Status Icon Component
 */
const StatusIcon = ({ status }) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
        case 'accepted':
        case 'approved':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'rejected':
            return <XCircle className="w-5 h-5 text-red-500" />;
        case 'pending':
        case 'under_review':
            return <Timer className="w-5 h-5 text-amber-500" />;
        case 'withdrawn':
            return <RefreshCw className="w-5 h-5 text-gray-500" />;
        default:
            return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
};

/**
 * Status Badge Component
 */
const StatusBadge = ({ status, isDark }) => {
    const statusLower = status?.toLowerCase();

    const statusStyles = {
        pending: isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200',
        under_review: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200',
        accepted: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200',
        approved: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200',
        rejected: isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200',
        withdrawn: isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-600 border-gray-200',
    };

    const style = statusStyles[statusLower] || (isDark ? 'bg-dark-700 text-dark-300 border-dark-600' : 'bg-gray-100 text-gray-700 border-gray-200');

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${style}`}>
            <StatusIcon status={status} />
            {status}
        </span>
    );
};

/**
 * Document Card using Headless Card
 */
const DocumentCard = ({ type, url, isDark }) => {
    const handleDownload = () => {
        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Document not available for download');
        }
    };

    const cardController = useCard({
        item: { type, url },
        onView: handleDownload,
    });

    const documentInfo = {
        resume: { label: 'Resume / CV', icon: FileText, color: 'primary' },
        cv: { label: 'Curriculum Vitae', icon: FileText, color: 'primary' },
        coverLetter: { label: 'Cover Letter', icon: FileText, color: 'violet' },
    };

    const info = documentInfo[type] || { label: type, icon: FileText, color: 'gray' };
    const IconComponent = info.icon;

    // Check if URL is valid
    const hasValidUrl = url && url.startsWith('http');

    return (
        <Card
            item={{ type, url }}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${cardController.isHovered ? 'shadow-md' : ''
                } ${isDark
                    ? 'bg-dark-700/30 border-dark-600 hover:bg-dark-700/50'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
        >
            {({ isHovered }) => (
                <>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark
                            ? `bg-${info.color}-500/20`
                            : `bg-${info.color}-100`
                            }`}>
                            <IconComponent className={`w-6 h-6 ${isDark ? `text-${info.color}-400` : `text-${info.color}-600`}`} />
                        </div>
                        <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {info.label}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                {hasValidUrl ? 'PDF Document' : 'Not available'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDownload}
                        disabled={!hasValidUrl}
                        className={`transition-all ${isHovered ? 'opacity-100' : 'opacity-70'} ${!hasValidUrl ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <Download className="w-4 h-4 mr-1" />
                        {hasValidUrl ? 'Download' : 'Unavailable'}
                    </Button>
                </>
            )}
        </Card>
    );
};


/**
 * Timeline Event Component
 */
const TimelineEvent = ({ event, isFirst, isDark }) => {
    return (
        <div className="relative animate-fade-in">
            <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${isFirst
                ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/30'
                : isDark
                    ? 'bg-dark-800 border-dark-600'
                    : 'bg-white border-gray-300'
                }`} />
            <div>
                <div className="flex items-center gap-2">
                    <StatusIcon status={event.status} />
                    <p className={`font-medium ${isFirst ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-dark-400' : 'text-gray-500')}`}>
                        {event.status}
                    </p>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                    {formatDateTime(event.date)}
                </p>
                {event.note && (
                    <p className={`text-sm mt-2 p-3 rounded-lg ${isDark ? 'bg-dark-700/50 text-dark-300' : 'bg-gray-100 text-gray-600'}`}>
                        {event.note}
                    </p>
                )}
            </div>
        </div>
    );
};

/**
 * Main Application Detail View Component
 */
export function ApplicationDetailView({
    application,
    onBack,
    onWithdraw,
    onReapply,
    actionLoading
}) {
    const { isDark } = useTheme();

    // Memoized status checks
    const statusInfo = useMemo(() => {
        const statusLower = application?.status?.toLowerCase() || '';
        return {
            isPending: statusLower === 'pending' || statusLower === 'under_review',
            isWithdrawn: statusLower === 'withdrawn',
            isRejected: statusLower === 'rejected',
            isAccepted: statusLower === 'accepted' || statusLower === 'approved',
        };
    }, [application?.status]);

    if (!application) return null;

    const cardClass = `p-6 rounded-2xl border transition-all ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`;
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <button
                        onClick={onBack}
                        className={`flex items-center gap-2 text-sm mb-4 transition-colors font-medium ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Applications
                    </button>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
                        {application.jobTitle}
                    </h1>
                    <div className={`flex flex-wrap items-center gap-3 mt-3 ${textSecondary}`}>
                        <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-primary-500" />
                            <span className="font-medium">{application.companyName}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {application.location || 'Remote'}
                        </span>
                        {application.employmentType && (
                            <>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" />
                                    {application.employmentType}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {statusInfo.isPending && (
                        <Button
                            variant="secondary"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={onWithdraw}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Processing...' : 'Withdraw'}
                        </Button>
                    )}
                    {(statusInfo.isWithdrawn || statusInfo.isRejected) && (
                        <Button
                            variant="primary"
                            onClick={onReapply}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Processing...' : 'Reapply'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card with headless Card */}
                    <Card
                        item={application}
                        className={cardClass}
                    >
                        {() => (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <h3 className={`text-lg font-semibold ${textPrimary}`}>Application Status</h3>
                                    <StatusBadge status={application.status} isDark={isDark} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
                                        <p className={`text-xs uppercase tracking-wider ${textSecondary}`}>Application ID</p>
                                        <p className={`font-mono text-sm mt-1 ${textPrimary}`}>{application.id}</p>
                                    </div>
                                    <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
                                        <p className={`text-xs uppercase tracking-wider ${textSecondary}`}>Submitted On</p>
                                        <p className={`text-sm mt-1 ${textPrimary}`}>
                                            {formatDateTime(application.appliedAt || application.appliedDate || application.createdAt)}
                                        </p>
                                    </div>
                                    {application.salary && (
                                        <div className={`p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50'}`}>
                                            <p className={`text-xs uppercase tracking-wider ${textSecondary}`}>Salary Range</p>
                                            <p className={`text-sm mt-1 font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                                <DollarSign className="w-4 h-4 inline" />
                                                {application.salary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </Card>

                    {/* Job Details Preview */}
                    <div className={cardClass}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
                            <Briefcase className="w-5 h-5 text-primary-500" />
                            Job Details
                        </h3>

                        {/* Skills Tags */}
                        {application.skills && application.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {application.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-700'
                                            }`}
                                    >
                                        <Tag className="w-3 h-3" />
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className={`prose prose-sm max-w-none ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            <p className="whitespace-pre-line">{application.jobDescription || 'No description available.'}</p>
                        </div>

                        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                            <a
                                href={`/jobs/${application.jobId || application.jobPostId}`}
                                className="text-primary-500 hover:text-primary-400 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
                            >
                                View Full Job Posting
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Attached Documents */}
                    <div className={cardClass}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
                            <FileText className="w-5 h-5 text-primary-500" />
                            Attached Documents
                        </h3>
                        <div className="space-y-3">
                            {(application.cvUrl || application.resume) && (
                                <DocumentCard
                                    type="cv"
                                    url={application.cvUrl || application.resume}
                                    isDark={isDark}
                                />
                            )}
                            {(application.coverLetterUrl || application.coverLetter) && (
                                <DocumentCard
                                    type="coverLetter"
                                    url={application.coverLetterUrl || application.coverLetter}
                                    isDark={isDark}
                                />
                            )}
                            {!application.cvUrl && !application.resume && !application.coverLetterUrl && !application.coverLetter && (
                                <p className={`text-center py-8 ${textSecondary}`}>
                                    No documents attached to this application.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Cover Letter Text */}
                    {application.coverLetterText && (
                        <div className={cardClass}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
                                <FileText className="w-5 h-5 text-violet-500" />
                                Cover Letter
                            </h3>
                            <div className={`prose prose-sm max-w-none ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                <p className="whitespace-pre-line">{application.coverLetterText}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Timeline */}
                <div className="lg:col-span-1">
                    <div className={`${cardClass} sticky top-24`}>
                        <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${textPrimary}`}>
                            <Clock className="w-5 h-5 text-primary-500" />
                            Timeline
                        </h3>

                        {application.timeline && application.timeline.length > 0 ? (
                            <div className={`relative pl-4 border-l-2 ${isDark ? 'border-dark-600' : 'border-gray-200'} space-y-6`}>
                                {application.timeline.map((event, index) => (
                                    <TimelineEvent
                                        key={index}
                                        event={event}
                                        isFirst={index === 0}
                                        isDark={isDark}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={`relative pl-4 border-l-2 ${isDark ? 'border-dark-600' : 'border-gray-200'} space-y-6`}>
                                <TimelineEvent
                                    event={{
                                        status: 'Application Submitted',
                                        date: application.appliedAt || application.appliedDate || application.createdAt
                                    }}
                                    isFirst={true}
                                    isDark={isDark}
                                />
                                {application.status !== 'Pending' && application.status !== 'PENDING' && (
                                    <TimelineEvent
                                        event={{
                                            status: application.status,
                                            date: application.updatedAt || application.appliedAt || application.appliedDate
                                        }}
                                        isFirst={false}
                                        isDark={isDark}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetailView;
