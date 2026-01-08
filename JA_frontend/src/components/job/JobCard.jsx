/**
 * Job Card Component
 * 
 * Displays a job posting in card format.
 * Used in: Job Search results, Saved Jobs, Job Recommendations
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Uses Headless UI Pattern
 * - Uses useCard hook from headless/card for card actions
 */

import React from "react";
import { MapPin, Briefcase, DollarSign, Clock, Building2, Bookmark, BookmarkCheck, Calendar, AlertTriangle } from "lucide-react";
import { Tag } from "../reusable";
import { useCard } from "../headless/card";


/**
 * JobCard Component
 * 
 * @param {Object} job - Job data object
 * @param {function} onView - Handler for viewing job details
 * @param {function} onApply - Handler for applying to job
 * @param {function} onSave - Handler for saving/bookmarking job
 * @param {boolean} isSaved - Whether job is saved/bookmarked
 * @param {string} variant - Theme variant: 'dark' | 'light'
 */
export function JobCard({
  job,
  onView,
  onApply,
  onSave,
  isSaved = false,
  variant = 'dark',
  className = '',
}) {
  const {
    id,
    title,
    company,
    companyLogo, // Company logo URL
    location,
    employmentType,
    salary,
    skills = [],
    fresher,
    postedAt,
    expiresAt, // Expiry date per Requirement 4.1.4
  } = job;

  // Check if job is expired
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  const themes = {
    dark: {
      card: 'bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200 group',
      title: 'text-lg font-semibold text-white group-hover:text-primary-400 transition-colors',
      company: 'text-dark-200 flex items-center gap-1.5', // Lighter for visibility
      meta: 'text-dark-300 text-sm flex items-center gap-1.5', // Changed from 400 to 300
      salary: 'text-green-400 font-semibold', // More visible green
      badge: 'bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium',
      expiredBadge: 'bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium',
      button: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      buttonPrimary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20',
      buttonSecondary: 'bg-dark-600 text-white border border-dark-500 hover:bg-dark-500 hover:border-dark-400', // Much more visible
      saveButton: 'p-2 rounded-lg hover:bg-dark-600 transition-colors',
      savedIcon: 'text-primary-400',
      unsavedIcon: 'text-dark-300 hover:text-white',
    },
    light: {
      card: 'bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200 group',
      title: 'text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors',
      company: 'text-gray-700 flex items-center gap-1.5', // Darker for visibility
      meta: 'text-gray-600 text-sm flex items-center gap-1.5', // Changed from 500 to 600
      salary: 'text-green-600 font-semibold',
      badge: 'bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium',
      expiredBadge: 'bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium',
      button: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      buttonPrimary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20',
      buttonSecondary: 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 hover:border-gray-400', // More visible
      saveButton: 'p-2 rounded-lg hover:bg-gray-100 transition-colors',
      savedIcon: 'text-primary-600',
      unsavedIcon: 'text-gray-500 hover:text-gray-700',
    },
  };

  const theme = themes[variant] || themes.dark;

  // Format employment type
  const formatEmploymentType = (type) => {
    const types = {
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'INTERNSHIP': 'Internship',
      'CONTRACT': 'Contract',
    };
    return types[type] || type;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`${theme.card} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Company Logo or Fallback */}
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={company}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${variant === 'dark' ? 'bg-gradient-to-br from-pink-500 to-violet-500 text-white' : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'}`}>
              {company?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3
              className={`${theme.title} cursor-pointer truncate`}
              onClick={() => onView && onView(job)}
            >
              {title}
            </h3>
            <p className={theme.company}>
              <Building2 className="w-4 h-4" />
              {company}
            </p>
          </div>
        </div>

        {onSave && (
          <button
            className={theme.saveButton}
            onClick={() => onSave(job)}
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
          >
            {isSaved ? (
              <BookmarkCheck className={`w-5 h-5 ${theme.savedIcon}`} />
            ) : (
              <Bookmark className={`w-5 h-5 ${theme.unsavedIcon}`} />
            )}
          </button>
        )}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className={theme.meta}>
          <MapPin className="w-4 h-4" />
          {location}
        </span>
        <span className={theme.meta}>
          <Briefcase className="w-4 h-4" />
          {formatEmploymentType(employmentType)}
        </span>
        {salary && (
          <span className={`${theme.meta} ${theme.salary}`}>
            <DollarSign className="w-4 h-4" />
            {salary}
          </span>
        )}
        {postedAt && (
          <span className={theme.meta}>
            <Clock className="w-4 h-4" />
            {formatDate(postedAt)}
          </span>
        )}
        {expiresAt && (
          <span className={theme.meta}>
            <Calendar className="w-4 h-4" />
            Expires: {formatDate(expiresAt)}
          </span>
        )}
        {isExpired && (
          <span className={theme.expiredBadge}>
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Expired
          </span>
        )}
        {fresher && !isExpired && (
          <span className={theme.badge}>Fresher Welcome</span>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 5).map((skill, index) => (
            <Tag
              key={index}
              label={skill}
              variant="skill"
              isDark={variant === 'dark'}
            />
          ))}
          {skills.length > 5 && (
            <Tag
              label={`+${skills.length - 5}`}
              variant="default"
              isDark={variant === 'dark'}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-dark-700/50">
        <button
          className={`${theme.button} ${theme.buttonSecondary}`}
          onClick={() => onView && onView(job)}
        >
          View Details
        </button>
        {onApply && (
          <button
            className={`${theme.button} ${theme.buttonPrimary}`}
            onClick={() => onApply(job)}
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * JobCardSkeleton - Loading placeholder
 */
export function JobCardSkeleton({ variant = 'dark' }) {
  const bgClass = variant === 'dark' ? 'bg-dark-700' : 'bg-gray-200';
  const cardClass = variant === 'dark'
    ? 'bg-dark-800/50 border border-dark-700'
    : 'bg-white border border-gray-200';

  return (
    <div className={`${cardClass} rounded-xl p-5 animate-pulse`}>
      <div className={`h-6 ${bgClass} rounded w-3/4 mb-2`} />
      <div className={`h-4 ${bgClass} rounded w-1/2 mb-4`} />
      <div className="flex gap-4 mb-4">
        <div className={`h-4 ${bgClass} rounded w-20`} />
        <div className={`h-4 ${bgClass} rounded w-24`} />
        <div className={`h-4 ${bgClass} rounded w-16`} />
      </div>
      <div className="flex gap-2 mb-4">
        <div className={`h-6 ${bgClass} rounded-full w-16`} />
        <div className={`h-6 ${bgClass} rounded-full w-20`} />
        <div className={`h-6 ${bgClass} rounded-full w-14`} />
      </div>
      <div className="flex gap-3 pt-3 border-t border-dark-700/50">
        <div className={`h-10 ${bgClass} rounded-lg w-28`} />
        <div className={`h-10 ${bgClass} rounded-lg w-24`} />
      </div>
    </div>
  );
}

export default JobCard;

