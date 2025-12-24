import React from 'react';
import {
    Building2, MapPin, Calendar, Clock, FileText,
    Download, ArrowLeft, ExternalLink
} from 'lucide-react';
import { Button } from '../reusable/Button';
import { formatDate, formatDateTime } from '../../utils/date';
import { useTheme } from '../../context/ThemeContext';

export function ApplicationDetailView({
    application,
    onBack,
    onWithdraw,
    onReapply,
    actionLoading
}) {
    const { isDark } = useTheme();

    if (!application) return null;

    const isPending = application.status.toLowerCase() === 'pending';
    const isWithdrawn = application.status.toLowerCase() === 'withdrawn';
    const isRejected = application.status.toLowerCase() === 'rejected';

    const cardClass = `
    p-6 rounded-2xl border
    ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
  `;

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={onBack}
                        className={`flex items-center gap-2 text-sm mb-3 transition-colors ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Applications
                    </button>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>{application.jobTitle}</h1>
                    <div className={`flex items-center gap-2 mt-2 ${textSecondary}`}>
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">{application.companyName}</span>
                        <span>•</span>
                        <MapPin className="w-4 h-4" />
                        <span>{application.location || 'Remote'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isPending && (
                        <Button
                            variant="secondary"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-fit"
                            onClick={onWithdraw}
                            disabled={actionLoading}
                        >
                            Withdraw Application
                        </Button>
                    )}
                    {(isWithdrawn || isRejected) && (
                        <Button
                            variant="primary"
                            onClick={onReapply}
                            disabled={actionLoading}
                        >
                            Reapply
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className={cardClass}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`font-semibold ${textPrimary}`}>Current Status</h3>
                            <span className={`
                px-3 py-1 rounded-full text-xs font-medium capitalize
                ${application.status === 'Pending'
                                    ? (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-800')
                                    : application.status === 'Accepted'
                                        ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800')
                                        : application.status === 'Rejected'
                                            ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800')
                                            : (isDark ? 'bg-dark-700 text-dark-300' : 'bg-gray-100 text-gray-800')
                                }
              `}>
                                {application.status}
                            </span>
                        </div>
                        <div className={`text-sm ${textSecondary}`}>
                            <p>Application ID: <span className={`font-mono ${textPrimary}`}>{application.id}</span></p>
                            <p className="mt-1">Submitted on: {formatDateTime(application.appliedDate)}</p>
                        </div>
                    </div>

                    {/* Job Details Preview */}
                    <div className={cardClass}>
                        <h3 className={`font-semibold mb-4 ${textPrimary}`}>Job Details</h3>
                        <div className={`prose prose-sm max-w-none ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            <p className="line-clamp-3">{application.jobDescription || 'No description available.'}</p>
                        </div>
                        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                            <a href={`/jobs/${application.jobId}`} className="text-primary-500 hover:text-primary-400 text-sm font-medium inline-flex items-center gap-1">
                                View Full Job Description <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className={cardClass}>
                        <h3 className={`font-semibold mb-4 ${textPrimary}`}>Attached Documents</h3>
                        <div className="space-y-3">
                            {['resume', 'coverLetter'].map((docType) => (
                                application[docType] && (
                                    <div key={docType} className={`
                    flex items-center justify-between p-3 rounded-xl border transition-colors
                    ${isDark
                                            ? 'bg-dark-700/30 border-dark-700 hover:bg-dark-700/50'
                                            : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                        }
                  `}>
                                        <div className="flex items-center gap-3">
                                            <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${isDark ? 'bg-dark-700 text-dark-300' : 'bg-white border border-gray-200 text-gray-500'}
                      `}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${textPrimary}`}>
                                                    {docType === 'resume' ? 'Resume.pdf' : 'Cover_Letter.pdf'}
                                                </p>
                                                <p className={`text-xs ${textSecondary}`}>PDF Document</p>
                                            </div>
                                        </div>
                                        <Button variant="link" size="sm" icon={Download}>Download</Button>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline Sidebar */}
                <div className="lg:col-span-1">
                    <div className={`${cardClass} h-full`}>
                        <h3 className={`font-semibold mb-6 ${textPrimary}`}>Timeline</h3>
                        <div className={`relative pl-4 border-l-2 ${isDark ? 'border-dark-700' : 'border-gray-100'} space-y-8`}>
                            {application.timeline?.map((event, index) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${index === 0
                                            ? 'bg-primary-600 border-primary-600 shadow-glow'
                                            : isDark
                                                ? 'bg-dark-800 border-dark-600'
                                                : 'bg-white border-gray-300'
                                        }`} />
                                    <div>
                                        <p className={`text-sm font-medium ${index === 0 ? textPrimary : textSecondary}`}>
                                            {event.status}
                                        </p>
                                        <p className={`text-xs mt-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                            {formatDateTime(event.date)}
                                        </p>
                                        {event.note && (
                                            <p className={`text-xs mt-2 p-2 rounded-lg ${isDark ? 'bg-dark-700/50 text-dark-400' : 'bg-gray-50 text-gray-500'}`}>
                                                {event.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetailView;
