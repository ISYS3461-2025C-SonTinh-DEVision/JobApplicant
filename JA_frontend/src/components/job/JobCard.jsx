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
import { MapPin, Briefcase, DollarSign, Clock, Building2, Bookmark, BookmarkCheck } from "lucide-react";
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
    location,
    employmentType,
    salary,
    skills = [],
    fresher,
    postedAt,
    expiresAt,
  } = job;

  const themes = {
    dark: {
      card: 'bg-dark-800/50 border border-dark-700 rounded-xl p-5 hover:border-dark-500 transition-all duration-200 group',
      title: 'text-lg font-semibold text-white group-hover:text-primary-400 transition-colors',
      company: 'text-dark-300 flex items-center gap-1.5',
      meta: 'text-dark-400 text-sm flex items-center gap-1.5',
      salary: 'text-accent-400 font-medium',
      badge: 'bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full',
      button: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      buttonPrimary: 'bg-primary-600 text-white hover:bg-primary-700',
      buttonSecondary: 'bg-dark-700 text-dark-200 hover:bg-dark-600',
      saveButton: 'p-2 rounded-lg hover:bg-dark-700 transition-colors',
      savedIcon: 'text-primary-400',
      unsavedIcon: 'text-dark-400 hover:text-white',
    },
    light: {
      card: 'bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 group',
      title: 'text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors',
      company: 'text-gray-600 flex items-center gap-1.5',
      meta: 'text-gray-500 text-sm flex items-center gap-1.5',
      salary: 'text-green-600 font-medium',
      badge: 'bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full',
      button: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      buttonPrimary: 'bg-primary-600 text-white hover:bg-primary-700',
      buttonSecondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      saveButton: 'p-2 rounded-lg hover:bg-gray-100 transition-colors',
      savedIcon: 'text-primary-600',
      unsavedIcon: 'text-gray-400 hover:text-gray-700',
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
        {fresher && (
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
              variant={variant === 'dark' ? 'primary' : 'default'}
            />
          ))}
          {skills.length > 5 && (
            <Tag
              label={`+${skills.length - 5}`}
              variant="default"
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

