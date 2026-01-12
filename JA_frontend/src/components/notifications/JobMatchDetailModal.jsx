/**
 * Job Match Detail Modal
 * 
 * Shows detailed breakdown of why a job matched the user's search profile.
 * Displays match score analysis, matched skills, salary comparison, etc.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Premium UI Design
 */

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    X, MapPin, DollarSign, Briefcase, Clock,
    CheckCircle2, Target, TrendingUp, Award,
    Building2, Calendar, ExternalLink, Zap
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

/**
 * Circular Progress Ring for Match Score
 * Redesigned with proper spacing to prevent text cramping
 */
const MatchScoreRing = ({ score, size = 160, isDark }) => {
    // Calculate dimensions with proper text breathing room
    const center = size / 2;
    const strokeWidth = 6;
    // Make radius smaller to leave more room for center text
    const radius = (size / 2) - strokeWidth - 20; // 20px padding from edge
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Color based on score
    const getScoreColor = () => {
        if (score >= 80) return { ring: '#10b981', text: 'text-emerald-500' };
        if (score >= 60) return { ring: '#3b82f6', text: 'text-blue-500' };
        if (score >= 40) return { ring: '#f59e0b', text: 'text-amber-500' };
        return { ring: '#ef4444', text: 'text-red-500' };
    };

    const colors = getScoreColor();

    return (
        <div
            className="relative flex-shrink-0"
            style={{ width: size, height: size }}
        >
            <svg
                className="transform -rotate-90"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
            >
                {/* Background ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                    strokeWidth={strokeWidth}
                />
                {/* Progress ring with gradient effect */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={colors.ring}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                        transition: 'stroke-dashoffset 1s ease-out',
                        filter: 'drop-shadow(0 0 6px ' + colors.ring + '40)'
                    }}
                />
            </svg>
            {/* Center content - positioned absolutely for perfect centering */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ padding: strokeWidth + 20 }} // Match the radius padding
            >
                <span className={`text-4xl font-bold tracking-tight ${colors.text}`}>
                    {Math.round(score)}%
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    Match
                </span>
            </div>
        </div>
    );
};


/**
 * Score Breakdown Item
 */
const ScoreBreakdownItem = ({ label, score, weight, icon: Icon, isDark }) => {
    const percentage = Math.round(score);
    const contribution = Math.round(score * weight);

    const getBarColor = () => {
        if (score >= 80) return isDark ? 'bg-emerald-500' : 'bg-emerald-500';
        if (score >= 50) return isDark ? 'bg-blue-500' : 'bg-blue-500';
        if (score >= 30) return isDark ? 'bg-amber-500' : 'bg-amber-500';
        return isDark ? 'bg-red-500' : 'bg-red-400';
    };

    return (
        <div className={`p-3 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-dark-200' : 'text-gray-700'}`}>
                        {label}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                        {weight}% weight
                    </span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {percentage}%
                    </span>
                </div>
            </div>
            <div className={`h-2 rounded-full ${isDark ? 'bg-dark-600' : 'bg-gray-200'}`}>
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${getBarColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

/**
 * Skill Tag with Match Status
 */
const SkillTag = ({ skill, isMatched, isDark }) => (
    <span className={`
        inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200
        ${isMatched
            ? isDark
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : isDark
                ? 'bg-dark-600 text-dark-400 border border-dark-500'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
        }
    `}>
        {isMatched && <CheckCircle2 className="w-3.5 h-3.5" />}
        {skill}
    </span>
);

/**
 * Main Job Match Detail Modal
 */
export default function JobMatchDetailModal({ isOpen, onClose, matchData }) {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    if (!matchData) return null;

    const {
        jobTitle,
        jobDescription,
        location,
        employmentTypes = [],
        salaryMin,
        salaryMax,
        salaryCurrency = 'USD',
        requiredSkills = [],
        matchedSkills = [],
        matchScore = 0,
        postedDate,
        expiryDate,
        jobPostId,
        // Real score breakdown from backend (actual algorithm results)
        skillsScore,
        salaryScore,
        locationScore,
        employmentScore,
        titleScore,
    } = matchData;

    // Use real scores from backend, fallback to calculated estimates if not available
    const getBreakdown = () => {
        // If backend provides real scores, use them directly
        if (skillsScore !== undefined && salaryScore !== undefined) {
            return {
                skills: skillsScore,
                salary: salaryScore,
                location: locationScore || 50,
                employment: employmentScore || 50,
                title: titleScore || 50,
            };
        }

        // Fallback: Calculate estimates based on available data
        // (for backward compatibility with old notifications without breakdown)
        const skillMatchRatio = requiredSkills.length > 0
            ? (matchedSkills.length / requiredSkills.length) * 100
            : 50;

        return {
            skills: Math.min(100, skillMatchRatio),
            salary: matchScore > 70 ? 85 : matchScore > 50 ? 65 : 40,
            location: location ? 100 : 50,
            employment: employmentTypes.length > 0 ? 90 : 50,
            title: matchScore > 60 ? 80 : 50,
        };
    };

    const breakdown = getBreakdown();


    const formatSalary = () => {
        if (!salaryMin && !salaryMax) return 'Not specified';
        if (salaryMin && salaryMax) {
            return `${salaryCurrency} ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`;
        }
        if (salaryMin) return `${salaryCurrency} ${salaryMin.toLocaleString()}+`;
        return `Up to ${salaryCurrency} ${salaryMax.toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleViewJob = () => {
        if (jobPostId) {
            onClose();
            navigate(`/dashboard/jobs/${jobPostId}`);
        }
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`
                                w-full max-w-2xl transform overflow-hidden rounded-3xl
                                shadow-2xl transition-all
                                ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white'}
                            `}>
                                {/* Header */}
                                <div className={`
                                    relative p-6 border-b
                                    ${isDark ? 'border-dark-700' : 'border-gray-100'}
                                `}>
                                    {/* Close button */}
                                    <button
                                        onClick={onClose}
                                        className={`
                                            absolute top-4 right-4 p-2 rounded-xl transition-colors
                                            ${isDark
                                                ? 'hover:bg-dark-700 text-dark-400 hover:text-white'
                                                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                            }
                                        `}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    {/* Title area with score ring */}
                                    <div className="flex items-center gap-6">
                                        <MatchScoreRing score={matchScore} isDark={isDark} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`
                                                    inline-flex items-center gap-1 text-xs font-semibold
                                                    px-2.5 py-1 rounded-full
                                                    ${isDark
                                                        ? 'bg-violet-500/20 text-violet-400'
                                                        : 'bg-violet-100 text-violet-700'
                                                    }
                                                `}>
                                                    <Zap className="w-3 h-3" />
                                                    Job Match
                                                </span>
                                            </div>
                                            <Dialog.Title className={`
                                                text-xl font-bold leading-tight
                                                ${isDark ? 'text-white' : 'text-gray-900'}
                                            `}>
                                                {jobTitle || 'Job Position'}
                                            </Dialog.Title>
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                {location && (
                                                    <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                        <MapPin className="w-4 h-4" />
                                                        {location}
                                                    </span>
                                                )}
                                                <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                    <DollarSign className="w-4 h-4" />
                                                    {formatSalary()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                    {/* Match Score Breakdown */}
                                    <div>
                                        <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            <TrendingUp className="w-4 h-4" />
                                            Match Score Breakdown
                                        </h3>
                                        <div className="space-y-2">
                                            <ScoreBreakdownItem
                                                label="Skills Match"
                                                score={breakdown.skills}
                                                weight={30}
                                                icon={Award}
                                                isDark={isDark}
                                            />
                                            <ScoreBreakdownItem
                                                label="Salary Range"
                                                score={breakdown.salary}
                                                weight={25}
                                                icon={DollarSign}
                                                isDark={isDark}
                                            />
                                            <ScoreBreakdownItem
                                                label="Location"
                                                score={breakdown.location}
                                                weight={20}
                                                icon={MapPin}
                                                isDark={isDark}
                                            />
                                            <ScoreBreakdownItem
                                                label="Employment Type"
                                                score={breakdown.employment}
                                                weight={15}
                                                icon={Briefcase}
                                                isDark={isDark}
                                            />
                                            <ScoreBreakdownItem
                                                label="Job Title"
                                                score={breakdown.title}
                                                weight={10}
                                                icon={Target}
                                                isDark={isDark}
                                            />
                                        </div>
                                    </div>

                                    {/* Matched Skills */}
                                    {requiredSkills.length > 0 && (
                                        <div>
                                            <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                Skills Analysis
                                                <span className={`text-xs font-normal ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                    ({matchedSkills.length}/{requiredSkills.length} matched)
                                                </span>
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {requiredSkills.map((skill) => (
                                                    <SkillTag
                                                        key={skill}
                                                        skill={skill}
                                                        isMatched={matchedSkills.some(
                                                            ms => ms.toLowerCase() === skill.toLowerCase()
                                                        )}
                                                        isDark={isDark}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Job Details */}
                                    <div className={`
                                        p-4 rounded-xl border
                                        ${isDark ? 'bg-dark-700/30 border-dark-600' : 'bg-gray-50 border-gray-100'}
                                    `}>
                                        <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            <Briefcase className="w-4 h-4" />
                                            Job Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {employmentTypes.length > 0 && (
                                                <div>
                                                    <span className={`block text-xs mb-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                                        Employment Type
                                                    </span>
                                                    <span className={isDark ? 'text-dark-200' : 'text-gray-700'}>
                                                        {employmentTypes.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <span className={`block text-xs mb-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                                    Posted
                                                </span>
                                                <span className={isDark ? 'text-dark-200' : 'text-gray-700'}>
                                                    {formatDate(postedDate)}
                                                </span>
                                            </div>
                                            {expiryDate && (
                                                <div>
                                                    <span className={`block text-xs mb-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                                        Expires
                                                    </span>
                                                    <span className={isDark ? 'text-dark-200' : 'text-gray-700'}>
                                                        {formatDate(expiryDate)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {jobDescription && (
                                            <div className="mt-4 pt-4 border-t border-dashed"
                                                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                                <span className={`block text-xs mb-2 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                                    Description
                                                </span>
                                                <p className={`text-sm leading-relaxed ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                                    {jobDescription.length > 300
                                                        ? `${jobDescription.slice(0, 300)}...`
                                                        : jobDescription
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className={`
                                    p-6 border-t flex items-center justify-between gap-3
                                    ${isDark ? 'border-dark-700 bg-dark-900/50' : 'border-gray-100 bg-gray-50'}
                                `}>
                                    <button
                                        onClick={onClose}
                                        className={`
                                            px-5 py-2.5 rounded-xl font-medium transition-colors
                                            ${isDark
                                                ? 'text-dark-300 hover:bg-dark-700'
                                                : 'text-gray-600 hover:bg-gray-200'
                                            }
                                        `}
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleViewJob}
                                        className={`
                                            flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium
                                            transition-all duration-200 transform hover:scale-105
                                            bg-gradient-to-r from-primary-500 to-accent-500 text-white
                                            shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40
                                        `}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View Full Job Post
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
