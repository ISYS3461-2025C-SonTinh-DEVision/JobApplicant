/**
 * Profile Dashboard Page
 * 
 * Displays complete user profile with all sections:
 * - Basic Info (Real API data)
 * - Education History (Mock data - API not available)
 * - Work Experience (Mock data - API not available)
 * - Technical Skills (Mock data - API not available)
 * - Portfolio (Mock data - API not available)
 * - Application Statistics (Mock data - API not available)
 * 
 * Architecture:
 * - A.3.a (Ultimo): Uses Headless UI hooks for modal, tabs, form, and data management
 * - A.2.a: Uses reusable UI components
 * - Light/Dark mode support via ThemeContext
 * - Data source indicators (real vs mock data)
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Calendar, Edit, Loader2,
  Briefcase, GraduationCap, Code, Award, FileText, TrendingUp,
  CheckCircle, Clock, XCircle, AlertCircle, Plus, Trash2, ExternalLink,
  Database, Server, Target, Save, Upload, Camera, Eye, ChevronRight, Search, Sparkles,
  BookOpen
} from 'lucide-react';
import ProfileService from '../../services/ProfileService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

import {
  useHeadlessModal,
  useHeadlessForm,
  useHeadlessDataList,
  useHeadlessPagination
} from '../../components/headless';

// Import Reusable Components
import { Card, FormInput, ConfirmDialog, SkillIcon, SKILL_ICONS, Pagination } from '../../components/reusable';
import DatePicker from '../../components/ui/DatePicker';

// Import Skills Data for smart skill selection
import { getSkillInfo, getSkillCategory, POPULAR_SKILLS, SKILL_CATEGORIES, searchSkills, getQuickAddSkills } from '../../data/skillsData';

/**
 * Sorting Utilities for Education and Work Experience
 * Architecture: A.2.a - Utility Functions for Data Processing
 * 
 * Sorting Logic:
 * 1. Currently active items (current/present) come first
 * 2. Then sorted by end date (most recent first)
 * 3. Then by start date (most recent first)
 */

/**
 * Check if education item is currently studying
 */
const isCurrentlyStudying = (item) => {
  if (!item.endYear) return true;
  const endYearStr = String(item.endYear).toLowerCase().trim();
  if (endYearStr === 'present' || endYearStr === 'current' || endYearStr === '') return true;
  const endYearNum = parseInt(endYearStr, 10);
  if (isNaN(endYearNum)) return false;
  return endYearNum >= new Date().getFullYear();
};

/**
 * Check if work experience item is currently working
 */
const isCurrentlyWorking = (item) => {
  if (!item.endDate || item.current || item.isCurrentlyWorking) return true;
  const endDateStr = String(item.endDate).toLowerCase().trim();
  if (endDateStr === 'present' || endDateStr === 'current' || endDateStr === '') return true;
  const endDate = new Date(item.endDate);
  if (isNaN(endDate.getTime())) return false;
  return endDate >= new Date();
};

/**
 * Sort education items: current first, then by year descending
 */
const sortEducationItems = (items) => {
  return [...items].sort((a, b) => {
    // Current students first
    const aIsCurrent = isCurrentlyStudying(a);
    const bIsCurrent = isCurrentlyStudying(b);

    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;

    // Sort by end year (most recent first)
    const aEndYear = parseInt(a.endYear, 10) || 9999;
    const bEndYear = parseInt(b.endYear, 10) || 9999;
    if (bEndYear !== aEndYear) return bEndYear - aEndYear;

    // Then by start year (most recent first)
    const aStartYear = parseInt(a.startYear, 10) || 0;
    const bStartYear = parseInt(b.startYear, 10) || 0;
    return bStartYear - aStartYear;
  });
};

/**
 * Sort work experience items: current first, then by date descending
 */
const sortExperienceItems = (items) => {
  return [...items].sort((a, b) => {
    // Currently working first
    const aIsCurrent = isCurrentlyWorking(a);
    const bIsCurrent = isCurrentlyWorking(b);

    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;

    // Sort by end date (most recent first)
    const aEndDate = a.endDate ? new Date(a.endDate).getTime() : Date.now();
    const bEndDate = b.endDate ? new Date(b.endDate).getTime() : Date.now();
    if (bEndDate !== aEndDate) return bEndDate - aEndDate;

    // Then by start date (most recent first)
    const aStartDate = a.startDate ? new Date(a.startDate).getTime() : 0;
    const bStartDate = b.startDate ? new Date(b.startDate).getTime() : 0;
    return bStartDate - aStartDate;
  });
};

/**
 * Data Source Indicator Component
 * Shows whether data is from real API or mock data
 */
function DataSourceIndicator({ isRealData, className = '' }) {
  const { isDark } = useTheme();

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      {isRealData ? (
        <>
          <Server className="w-3 h-3 text-green-500" />
          <span className={isDark ? 'text-green-400' : 'text-green-600'}>API Data</span>
        </>
      ) : (
        <>
          <Database className="w-3 h-3 text-amber-500" />
          <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>Mock Data</span>
        </>
      )}
    </div>
  );
}

/**
 * Profile Header Section with Avatar and Basic Info
 */
function ProfileHeader({ profile, onEdit, isRealData, onAvatarUpload, uploadingAvatar, avatarInputRef }) {
  const { isDark } = useTheme();
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'No name set';
  const initial = (fullName[0] || 'U').toUpperCase();

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border
      ${isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/10" />

      <div className="relative p-6 sm:p-8">
        {/* Data Source Indicator */}
        <div className="absolute top-4 right-4">
          <DataSourceIndicator isRealData={isRealData} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar with Upload Button */}
          <div className="relative group">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl">
                {initial}
              </div>
            )}

            {/* Avatar Upload Button Overlay */}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={onAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => avatarInputRef?.current?.click()}
              disabled={uploadingAvatar}
              className={`
                absolute bottom-1 right-1 w-10 h-10 rounded-full border-4 flex items-center justify-center
                transition-all duration-200 group-hover:scale-110
                ${isDark ? 'border-dark-800' : 'border-white'}
                ${uploadingAvatar
                  ? 'bg-dark-600 cursor-not-allowed'
                  : 'bg-accent-500 hover:bg-accent-600 cursor-pointer'
                }
              `}
              title="Upload avatar"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {fullName}
                </h1>
                <div className={`flex flex-wrap items-center gap-4 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profile?.email || 'No email'}</span>
                  </div>
                  {profile?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile?.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{typeof profile.country === 'object' ? profile.country.name : profile.country}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-glow"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            </div>

            {/* Address */}
            {(profile?.address || profile?.city) && (
              <div className={`mt-4 flex items-start gap-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                <MapPin className="w-4 h-4 mt-0.5" />
                <span className="text-sm">
                  {[profile.address, profile.city].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {/* Join Date */}
            {profile?.createdAt && (
              <div className={`mt-2 flex items-center gap-2 text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stats Card Component - Reusable statistic display
 */
function StatsCard({ icon: Icon, label, value, color = 'primary' }) {
  const { isDark } = useTheme();

  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  };

  return (
    <div className={`
      p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02]
      ${isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{label}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Section Card Component - Container for profile sections
 */
function SectionCard({ icon: Icon, title, children, action, isRealData }) {
  const { isDark } = useTheme();

  return (
    <div className={`
      p-6 rounded-2xl border
      ${isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex items-center gap-3">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
            {isRealData !== undefined && <DataSourceIndicator isRealData={isRealData} />}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ icon: Icon, message, action }) {
  const { isDark } = useTheme();

  return (
    <div className="text-center py-12">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
        <Icon className={`w-8 h-8 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
      </div>
      <p className={`mb-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{message}</p>
      {action}
    </div>
  );
}

/**
 * Education Item Component - Enhanced UI with animations
 * Architecture: A.1.c Reusable UI Component
 * Detects currently studying status based on endYear
 */
function EducationItem({ item, onEdit, onDelete }) {
  const { isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Determine if currently studying based on endYear
  const currentYear = new Date().getFullYear();
  const isCurrentlyStudying = (() => {
    if (!item.endYear) return true; // No end year means still studying
    const endYearStr = String(item.endYear).toLowerCase().trim();
    if (endYearStr === 'present' || endYearStr === 'current' || endYearStr === '') return true;
    const endYearNum = parseInt(endYearStr, 10);
    if (isNaN(endYearNum)) return false;
    return endYearNum >= currentYear;
  })();

  // Dynamic styling based on study status
  const statusStyles = isCurrentlyStudying
    ? {
      borderColor: isDark ? 'border-accent-500/50 hover:border-accent-400' : 'border-accent-500 hover:border-accent-400',
      iconBg: 'bg-gradient-to-br from-accent-500 to-accent-600',
      shadowColor: isDark ? 'hover:shadow-accent-500/10' : '',
    }
    : {
      borderColor: isDark ? 'border-primary-500/50 hover:border-primary-400' : 'border-primary-500 hover:border-primary-400',
      iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      shadowColor: isDark ? 'hover:shadow-primary-500/10' : '',
    };

  return (
    <div
      className={`
        relative p-5 rounded-xl border-l-4 transition-all duration-300 ease-out
        ${isDark
          ? `bg-gradient-to-r from-dark-700/80 to-dark-700/40 ${statusStyles.borderColor} hover:shadow-lg ${statusStyles.shadowColor}`
          : `bg-gradient-to-r from-white to-gray-50/50 ${statusStyles.borderColor} shadow-sm hover:shadow-md`
        }
        ${isHovered ? 'transform scale-[1.01]' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Icon - BookOpen for studying, GraduationCap for graduated */}
      <div className={`
        absolute -left-3 top-4 w-6 h-6 rounded-full flex items-center justify-center
        ${statusStyles.iconBg} shadow-lg
        transition-transform duration-300 ${isHovered ? 'scale-110' : ''}
      `}>
        {isCurrentlyStudying ? (
          <BookOpen className="w-3.5 h-3.5 text-white" />
        ) : (
          <GraduationCap className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      <div className="flex items-start justify-between ml-2">
        <div className="flex-1">
          {/* Degree with status badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {item.degree}
            </h3>
            {isCurrentlyStudying && (
              <span className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                animate-pulse-subtle
                ${isDark
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                  : 'bg-accent-100 text-accent-700 border border-accent-200'
                }
              `}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Currently Studying
              </span>
            )}
          </div>
          <p className={`font-medium text-sm mt-0.5 ${isCurrentlyStudying ? 'text-accent-400' : 'text-primary-400'}`}>
            {item.institution}
          </p>
          <div className={`flex items-center gap-3 mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {item.startYear} - {item.endYear || 'Present'}
            </span>
            {item.gpa && (() => {
              // GPA color coding (0-100 scale)
              const gpaValue = parseFloat(item.gpa);
              let gpaStyle = '';
              let gpaLabel = '';
              if (isNaN(gpaValue)) {
                gpaStyle = isDark ? 'bg-dark-600/50 text-dark-300' : 'bg-gray-100 text-gray-600';
                gpaLabel = '';
              } else if (gpaValue >= 85) {
                // Excellent GPA - Gold/Green with glow
                gpaStyle = isDark
                  ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-300';
                gpaLabel = ' ⭐';
              } else if (gpaValue >= 70) {
                // Good GPA - Blue
                gpaStyle = isDark
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-primary-100 text-primary-700 border border-primary-200';
                gpaLabel = '';
              } else if (gpaValue >= 50) {
                // Average GPA - Yellow/Amber
                gpaStyle = isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-700 border border-amber-200';
                gpaLabel = '';
              } else {
                // Low GPA - Red/Orange
                gpaStyle = isDark
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-red-100 text-red-700 border border-red-200';
                gpaLabel = '';
              }
              return (
                <span className={`
                  px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-300
                  ${gpaStyle}
                `}>
                  GPA: {item.gpa}{gpaLabel}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Action Buttons - Appear on hover */}
        <div className={`
          flex items-center gap-1 transition-all duration-300
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}>
          <button
            onClick={() => onEdit(item)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark
                ? 'text-dark-400 hover:text-primary-400 hover:bg-primary-500/10'
                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
              }
            `}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark
                ? 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }
            `}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Experience Item Component - Enhanced UI with timeline
 * Architecture: A.1.c Reusable UI Component
 * Detects currently working status based on endDate
 */
function ExperienceItem({ item, onEdit, onDelete }) {
  const { isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date for better display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Determine if currently working based on endDate
  const isCurrentlyWorking = (() => {
    if (!item.endDate) return true; // No end date means still working
    const endDateStr = String(item.endDate).toLowerCase().trim();
    if (endDateStr === 'present' || endDateStr === 'current' || endDateStr === '') return true;
    const endDate = new Date(item.endDate);
    if (isNaN(endDate.getTime())) return false;
    return endDate >= new Date();
  })();

  // Dynamic styling based on work status
  const statusStyles = isCurrentlyWorking
    ? {
      borderColor: isDark ? 'border-accent-500/50 hover:border-accent-400' : 'border-accent-500 hover:border-accent-400',
      iconBg: 'bg-gradient-to-br from-accent-500 to-accent-600',
      timelineColor: 'bg-gradient-to-b from-accent-500 via-accent-400 to-accent-600',
      shadowColor: isDark ? 'hover:shadow-accent-500/10' : '',
    }
    : {
      borderColor: isDark ? 'border-dark-600 hover:border-dark-500' : 'border-gray-300 hover:border-gray-400',
      iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
      timelineColor: 'bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600',
      shadowColor: isDark ? 'hover:shadow-dark-500/10' : '',
    };

  return (
    <div
      className={`
        relative p-5 rounded-xl border transition-all duration-300 ease-out group
        ${isDark
          ? `bg-gradient-to-br from-dark-700/80 via-dark-700/60 to-dark-800/40 ${statusStyles.borderColor} hover:shadow-lg ${statusStyles.shadowColor}`
          : `bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 ${statusStyles.borderColor} shadow-sm hover:shadow-md`
        }
        ${isHovered ? 'transform scale-[1.01]' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline connector */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1 rounded-l-xl
        ${statusStyles.timelineColor}
        transition-all duration-300 ${isHovered ? 'w-1.5' : ''}
      `} />

      {/* Company Icon - Briefcase for working, Clock/History for past */}
      <div className={`
        absolute -left-3 top-5 w-6 h-6 rounded-full flex items-center justify-center
        ${statusStyles.iconBg} shadow-lg
        transition-transform duration-300 ${isHovered ? 'scale-110' : ''}
      `}>
        {isCurrentlyWorking ? (
          <Briefcase className="w-3.5 h-3.5 text-white" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      <div className="flex items-start justify-between ml-3">
        <div className="flex-1">
          {/* Job Title with status badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {item.title}
            </h3>
            {isCurrentlyWorking ? (
              <span className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                ${isDark
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                  : 'bg-accent-100 text-accent-700 border border-accent-200'
                }
              `}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Currently Working
              </span>
            ) : (
              <span className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${isDark
                  ? 'bg-dark-600/50 text-dark-400 border border-dark-500/50'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                }
              `}>
                Previous Role
              </span>
            )}
          </div>
          <p className={`font-medium text-sm mt-0.5 ${isCurrentlyWorking ? 'text-accent-400' : (isDark ? 'text-dark-400' : 'text-gray-500')}`}>
            {item.company}
          </p>

          <div className={`flex items-center gap-2 mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
              ${isDark ? 'bg-dark-600/50' : 'bg-gray-100'}
            `}>
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(item.startDate)} — {formatDate(item.endDate)}
            </span>
          </div>

          {item.description && (
            <div className="mt-3">
              <p className={`
                text-sm leading-relaxed
                ${isDark ? 'text-dark-300' : 'text-gray-600'}
                ${!isExpanded && item.description.length > 150 ? 'line-clamp-2' : ''}
              `}>
                {item.description}
              </p>
              {item.description.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-primary-400 hover:text-primary-300 mt-1 font-medium"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Appear on hover */}
        <div className={`
          flex items-center gap-1 transition-all duration-300
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}>
          <button
            onClick={() => onEdit(item)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark
                ? 'text-dark-400 hover:text-primary-400 hover:bg-primary-500/10'
                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
              }
            `}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark
                ? 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }
            `}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Skill Tag Component - Enhanced with icons and category colors
 */
function SkillTag({ skill, onRemove, showIcon = true }) {
  const { isDark } = useTheme();
  const category = getSkillCategory(skill);

  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border 
      transition-all duration-200 group hover:scale-105
      ${isDark
        ? `bg-gradient-to-r ${category.bgColor} ${category.borderColor} text-white/90 hover:shadow-lg`
        : `bg-gradient-to-r from-white to-gray-50 ${category.borderColor} text-gray-800 hover:shadow-md`
      }
    `}>
      {showIcon && (
        <SkillIcon skill={skill} size="w-4 h-4" />
      )}
      <span className="font-medium">{skill}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className={`
            w-5 h-5 rounded-full flex items-center justify-center 
            transition-all duration-200 opacity-60 group-hover:opacity-100
            ${isDark
              ? 'hover:bg-red-500/30 hover:text-red-300'
              : 'hover:bg-red-100 hover:text-red-600'
            }
          `}
        >
          <XCircle className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
}

/**
 * Generic Modal Component using Headless Modal hook
 */
function Modal({ isOpen, onClose, title, children }) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`
            rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in border
            max-h-[90vh] flex flex-col overflow-hidden
            ${isDark
              ? 'bg-dark-800 border-dark-700'
              : 'bg-white border-gray-200'
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-5 border-b flex-shrink-0 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <button
              onClick={onClose}
              className={`transition-colors ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-5 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Profile Dashboard Page - Main Component
 */
export default function ProfileDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileFromApi, setIsProfileFromApi] = useState(false);
  const hasInitialized = useRef(false);

  // === HEADLESS UI HOOKS INTEGRATION ===

  // Education Modal - Using useHeadlessModal
  const educationModal = useHeadlessModal();

  // Experience Modal - Using useHeadlessModal
  const experienceModal = useHeadlessModal();

  // Skills Modal - Using useHeadlessModal
  const skillsModal = useHeadlessModal();

  // Education Data List - Using useHeadlessDataList
  const educationList = useHeadlessDataList({
    initialData: [],
    idKey: 'id'
  });

  // Experience Data List - Using useHeadlessDataList
  const experienceList = useHeadlessDataList({
    initialData: [],
    idKey: 'id'
  });

  // === PAGINATION HOOKS ===
  // Architecture: A.3.a - Headless pagination for Education section
  const educationPagination = useHeadlessPagination({
    data: sortEducationItems(educationList.items),
    initialPageSize: 3, // Show 3 items per page in dashboard context
  });

  // Architecture: A.3.a - Headless pagination for Work Experience section
  const experiencePagination = useHeadlessPagination({
    data: sortExperienceItems(experienceList.items),
    initialPageSize: 3,
  });

  // Skills state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [skillSaving, setSkillSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all'); // For category filter
  const [customSkillIcons, setCustomSkillIcons] = useState(() => {
    // Load custom icons from localStorage
    const saved = localStorage.getItem('customSkillIcons');
    return saved ? JSON.parse(saved) : {};
  });
  const [iconPicker, setIconPicker] = useState({
    isOpen: false,
    skillName: '',
    pendingAdd: false
  });
  const [viewAllSkillsOpen, setViewAllSkillsOpen] = useState(false);

  // Objective Summary state (Requirement 3.1.2)
  const [objectiveSummary, setObjectiveSummary] = useState('');
  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [tempObjective, setTempObjective] = useState('');
  const [savingObjective, setSavingObjective] = useState(false);

  // Avatar upload state (Requirement 3.2.1)
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Edit mode tracking for forms
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [editingExperienceId, setEditingExperienceId] = useState(null);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: null, // 'education' | 'experience'
    id: null,
    title: '',
    message: '',
    loading: false
  });

  // Application stats (mock data - API not available)
  const [applications] = useState({ total: 12, pending: 5, accepted: 3, rejected: 4 });

  // Education Form using useHeadlessForm
  const educationForm = useHeadlessForm({
    initialValues: {
      degree: '',
      institution: '',
      startYear: '',
      endYear: '',
      gpa: ''
    },
    validate: (values) => {
      const errors = {};
      if (!values.degree) errors.degree = 'Degree is required';
      if (!values.institution) errors.institution = 'Institution is required';
      if (!values.startYear) errors.startYear = 'Start year is required';
      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Map form values to API format
        const apiData = {
          degree: values.degree,
          institution: values.institution,
          fieldOfStudy: values.degree, // Use degree as field of study
          startDate: `${values.startYear}-01-01`,
          endDate: values.endYear ? `${values.endYear}-12-31` : null,
          current: !values.endYear,
          description: values.gpa ? `GPA: ${values.gpa}` : ''
        };

        if (editingEducationId) {
          // Update existing
          await ProfileService.updateEducation(editingEducationId, apiData);
          educationList.updateItem(editingEducationId, { ...values, id: editingEducationId });
          setEditingEducationId(null);
        } else {
          // Add new
          const response = await ProfileService.addEducation(apiData);
          const newEducation = {
            id: response?.id || Date.now().toString(),
            ...values
          };
          educationList.addItem(newEducation);
        }
        educationModal.close();
        educationForm.resetForm();
      } catch (error) {
        console.error('[ProfileDashboard] Error saving education:', error);
        alert('Failed to save education. Please try again.');
      }
    }
  });

  // Experience Form using useHeadlessForm
  // Architecture: A.2.a Form Management with Smart Validation
  const experienceForm = useHeadlessForm({
    initialValues: {
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      isCurrentlyWorking: false,
      description: ''
    },
    validate: (values) => {
      const errors = {};
      if (!values.title) errors.title = 'Job title is required';
      if (!values.company) errors.company = 'Company is required';
      if (!values.startDate) errors.startDate = 'Start date is required';

      // Validate End Date > Start Date (only if not currently working)
      // DatePicker outputs YYYY-MM-DD format
      if (!values.isCurrentlyWorking && values.endDate && values.startDate) {
        const startDate = new Date(values.startDate);
        const endDate = new Date(values.endDate);
        if (endDate < startDate) {
          errors.endDate = 'End date must be after start date';
        }
      }

      // Require end date if not currently working
      if (!values.isCurrentlyWorking && !values.endDate) {
        errors.endDate = 'End date is required or mark as currently working';
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Map form values to API format
        // DatePicker outputs YYYY-MM-DD format directly - no need to append -01
        const apiData = {
          position: values.title,
          company: values.company,
          startDate: values.startDate || null,
          endDate: values.isCurrentlyWorking ? null : (values.endDate || null),
          current: values.isCurrentlyWorking,
          description: values.description || ''
        };

        if (editingExperienceId) {
          // Update existing
          await ProfileService.updateWorkExperience(editingExperienceId, apiData);
          experienceList.updateItem(editingExperienceId, { ...values, id: editingExperienceId });
          setEditingExperienceId(null);
        } else {
          // Add new
          const response = await ProfileService.addWorkExperience(apiData);
          const newExperience = {
            id: response?.id || Date.now().toString(),
            ...values
          };
          experienceList.addItem(newExperience);
        }
        experienceModal.close();
        experienceForm.resetForm();
      } catch (error) {
        console.error('[ProfileDashboard] Error saving experience:', error);
        alert('Failed to save experience. Please try again.');
      }
    }
  });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    // Prevent duplicate initialization
    if (hasInitialized.current) {
      setLoading(false);
      return;
    }

    // If no user, show mock profile data (for demo/testing)
    if (!currentUser) {
      hasInitialized.current = true;
      setProfile({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@devision.com',
        country: 'Vietnam',
        phoneNumber: '+84 123 456 789',
        address: '702 Nguyễn Văn Linh',
        city: 'Ho Chi Minh City',
        createdAt: new Date().toISOString()
      });
      setIsProfileFromApi(false);

      // Add mock education/experience/skills
      educationList.addItem({
        id: '1',
        degree: 'Bachelor of Software Engineering (Hons)',
        institution: 'RMIT University Vietnam',
        startYear: '2021',
        endYear: '2025',
        gpa: '3.7'
      });
      educationList.addItem({
        id: '2',
        degree: 'High School Diploma',
        institution: 'Le Hong Phong High School',
        startYear: '2018',
        endYear: '2021',
        gpa: ''
      });
      experienceList.addItem({
        id: '1',
        title: 'Frontend Developer Intern',
        company: 'DEVision Technology',
        startDate: '2024-06',
        endDate: '',
        description: 'Building responsive web applications using React and Tailwind CSS. Contributing to UI component library development.'
      });
      experienceList.addItem({
        id: '2',
        title: 'Teaching Assistant',
        company: 'RMIT University',
        startDate: '2023-09',
        endDate: '2024-05',
        description: 'Assisted students in Web Programming course with HTML, CSS, JavaScript fundamentals.'
      });
      setSkills(['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python', 'Git', 'Docker']);
      setObjectiveSummary('Passionate software engineering student seeking challenging opportunities to apply my technical skills in real-world projects. Eager to learn and grow in a dynamic, innovative environment.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use /api/applicants/me endpoint for authenticated user
      let data;
      try {
        data = await ProfileService.getMyProfile();
        console.log('[ProfileDashboard] Loaded profile from /me:', data);
      } catch (meError) {
        console.warn('[ProfileDashboard] /me failed, trying legacy endpoint:', meError);
        // Fallback to legacy endpoint
        if (currentUser.userId) {
          data = await ProfileService.getProfileByUserId(currentUser.userId);
        } else {
          throw meError;
        }
      }

      if (data && data.id) {
        // Use normalized country fields
        const countryDisplay = data.countryName ||
          (typeof data.country === 'object' ? data.country?.displayName : data.country) ||
          'Not set';

        setProfile({
          ...data,
          email: currentUser.email,
          country: countryDisplay
        });
        setIsProfileFromApi(true);

        // Load education from API response - use setItems to replace entire list
        if (data.education && data.education.length > 0) {
          const mappedEducation = data.education.map(item => ({
            id: item.id,
            degree: item.degree,
            institution: item.institution,
            startYear: item.startDate ? new Date(item.startDate).getFullYear().toString() : '',
            endYear: item.current ? 'Current' : (item.endDate ? new Date(item.endDate).getFullYear().toString() : ''),
            // Parse GPA from gpa field, or extract from description (format: "GPA: X.XX")
            gpa: item.gpa || (item.description?.match(/GPA:\s*([\d.]+)/i)?.[1]) || ''
          }));
          educationList.setItems(mappedEducation);
        } else {
          educationList.setItems([]);
        }

        // Load work experience from API response - use setItems to replace entire list
        if (data.workExperience && data.workExperience.length > 0) {
          const mappedExperience = data.workExperience.map(item => ({
            id: item.id,
            title: item.position,
            company: item.company,
            startDate: item.startDate,
            endDate: item.current ? '' : item.endDate,
            description: item.description
          }));
          experienceList.setItems(mappedExperience);
        } else {
          experienceList.setItems([]);
        }

        // Load skills from API response
        if (data.skills && data.skills.length > 0) {
          setSkills(data.skills);
        }

        // Load objective summary
        if (data.objectiveSummary) {
          setObjectiveSummary(data.objectiveSummary);
        }
      } else {
        // Fallback to mock profile data
        setProfile({
          firstName: currentUser.firstName || 'Demo',
          lastName: currentUser.lastName || 'User',
          email: currentUser.email,
          country: 'Vietnam',
          createdAt: new Date().toISOString()
        });
        setIsProfileFromApi(false);

        // Add mock education/experience/skills data
        educationList.addItem({
          id: '1',
          degree: 'Bachelor of Software Engineering',
          institution: 'RMIT University Vietnam',
          startYear: '2021',
          endYear: '2025',
          gpa: '3.5'
        });
        experienceList.addItem({
          id: '1',
          title: 'Frontend Developer Intern',
          company: 'Tech Corp Vietnam',
          startDate: '2024-06',
          endDate: '',
          description: 'Developed responsive web applications using React and Tailwind CSS.'
        });
        setSkills(['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Node.js']);
      }
    } catch (err) {
      console.error('[ProfileDashboard] Error fetching profile:', err);
      // Fallback to mock data on error
      setProfile({
        firstName: currentUser?.firstName || 'Demo',
        lastName: currentUser?.lastName || 'User',
        email: currentUser?.email || 'user@example.com',
        country: 'Vietnam',
        createdAt: new Date().toISOString()
      });
      setIsProfileFromApi(false);
      setSkills(['React', 'JavaScript', 'Python']);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Track previous userId to detect user changes
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    // Reset hasInitialized if userId changes (user logged in/out or switched)
    if (prevUserIdRef.current !== currentUser?.userId) {
      hasInitialized.current = false;
      // Clear existing data when user changes
      educationList.clearItems?.() || educationList.setItems?.([]);
      experienceList.clearItems?.() || experienceList.setItems?.([]);
      setSkills([]);
      prevUserIdRef.current = currentUser?.userId;
    }
    fetchProfile();
  }, [currentUser?.userId, fetchProfile]);

  // Add skill handler - calls API (accepts optional skillName for quick-add)
  // Check if skill is a known skill from our database
  const isKnownSkill = (name) => {
    const allSkills = Object.values(POPULAR_SKILLS).flat();
    return allSkills.some(s => s.name.toLowerCase() === name.toLowerCase());
  };

  // Actually add the skill (after icon is selected for custom skills)
  const confirmAddSkill = async (skillName, selectedIconKey = null) => {
    if (skillName && !skills.includes(skillName)) {
      setSkillSaving(true);
      try {
        // If custom icon was selected, save it
        if (selectedIconKey) {
          const updatedIcons = { ...customSkillIcons, [skillName.toLowerCase()]: selectedIconKey };
          setCustomSkillIcons(updatedIcons);
          localStorage.setItem('customSkillIcons', JSON.stringify(updatedIcons));
        }
        await ProfileService.addSkill(skillName);
        setSkills([...skills, skillName]);
        setNewSkill('');
        setIconPicker({ isOpen: false, skillName: '', pendingAdd: false });
      } catch (error) {
        console.error('[ProfileDashboard] Error adding skill:', error);
        alert('Failed to add skill. Please try again.');
      } finally {
        setSkillSaving(false);
      }
    }
  };

  const handleAddSkill = async (skillName = null) => {
    const trimmedSkill = skillName ? skillName.trim() : newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      // Check if it's a known skill
      if (isKnownSkill(trimmedSkill)) {
        // Known skill - add directly
        await confirmAddSkill(trimmedSkill);
      } else {
        // Custom skill - show icon picker
        setIconPicker({
          isOpen: true,
          skillName: trimmedSkill,
          pendingAdd: true
        });
      }
    }
  };

  // Remove skill handler - calls API
  const handleRemoveSkill = async (skillToRemove) => {
    try {
      await ProfileService.deleteSkill(skillToRemove);
      setSkills(skills.filter(s => s !== skillToRemove));
    } catch (error) {
      console.error('[ProfileDashboard] Error removing skill:', error);
      alert('Failed to remove skill. Please try again.');
    }
  };

  // Delete education handler - opens custom dialog
  const handleDeleteEducation = (id) => {
    const item = educationList.items.find(e => e.id === id);
    setDeleteDialog({
      isOpen: true,
      type: 'education',
      id,
      title: 'Delete Education',
      message: `Are you sure you want to delete "${item?.degree || 'this education'}" from ${item?.institution || 'your profile'}? This action cannot be undone.`,
      loading: false
    });
  };

  // Delete experience handler - opens custom dialog
  const handleDeleteExperience = (id) => {
    const item = experienceList.items.find(e => e.id === id);
    setDeleteDialog({
      isOpen: true,
      type: 'experience',
      id,
      title: 'Delete Work Experience',
      message: `Are you sure you want to delete "${item?.title || 'this position'}" at ${item?.company || 'this company'}? This action cannot be undone.`,
      loading: false
    });
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      if (deleteDialog.type === 'education') {
        await ProfileService.deleteEducation(deleteDialog.id);
        educationList.removeItem(deleteDialog.id);
      } else if (deleteDialog.type === 'experience') {
        await ProfileService.deleteWorkExperience(deleteDialog.id);
        experienceList.removeItem(deleteDialog.id);
      }
      setDeleteDialog({ isOpen: false, type: null, id: null, title: '', message: '', loading: false });
    } catch (error) {
      console.error(`[ProfileDashboard] Error deleting ${deleteDialog.type}:`, error);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
      alert(`Failed to delete ${deleteDialog.type}. Please try again.`);
    }
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    if (!deleteDialog.loading) {
      setDeleteDialog({ isOpen: false, type: null, id: null, title: '', message: '', loading: false });
    }
  };

  // Avatar upload handler (Requirement 3.2.1)
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await ProfileService.uploadMyAvatar(file);
      // Update profile with new avatar URL
      setProfile(prev => ({ ...prev, avatarUrl: response?.avatarUrl || response }));
      alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('[ProfileDashboard] Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className={isDark ? 'text-dark-400' : 'text-gray-500'}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`p-8 max-w-md rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error Loading Profile</h3>
            <p className={`mb-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{error}</p>
            <button
              onClick={fetchProfile}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Objective Summary handlers
  const handleEditObjective = () => {
    setTempObjective(objectiveSummary);
    setIsEditingObjective(true);
  };

  const handleSaveObjective = async () => {
    setSavingObjective(true);
    try {
      await ProfileService.updateMyProfile({ objectiveSummary: tempObjective });
      setObjectiveSummary(tempObjective);
      setIsEditingObjective(false);
    } catch (error) {
      console.error('[ProfileDashboard] Error saving objective:', error);
      alert('Failed to save objective summary. Please try again.');
    } finally {
      setSavingObjective(false);
    }
  };

  const handleCancelObjective = () => {
    setIsEditingObjective(false);
    setTempObjective('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        onEdit={() => navigate('/dashboard/profile/edit')}
        isRealData={isProfileFromApi}
        onAvatarUpload={handleAvatarUpload}
        uploadingAvatar={uploadingAvatar}
        avatarInputRef={avatarInputRef}
      />

      {/* Objective Summary Section (Requirement 3.1.2) */}
      <div className={`
        p-6 rounded-2xl border transition-all duration-300
        ${isDark
          ? 'bg-dark-800 border-dark-700'
          : 'bg-white border-gray-200 shadow-sm'
        }
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent-400" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Objective Summary</h2>
              <DataSourceIndicator isRealData={isProfileFromApi} />
            </div>
          </div>
          {!isEditingObjective && (
            <button
              onClick={handleEditObjective}
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {isEditingObjective ? (
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              <textarea
                value={tempObjective}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setTempObjective(e.target.value);
                  }
                }}
                placeholder="Write a brief summary of your career objectives, goals, and aspirations..."
                rows={4}
                maxLength={500}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-none
                  ${isDark
                    ? 'bg-dark-700 border-dark-600 text-white placeholder:text-dark-500 focus:border-primary-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              />
              {/* Character counter */}
              <div className={`
                absolute bottom-3 right-3 text-xs font-medium
                ${tempObjective.length >= 450
                  ? (tempObjective.length >= 490 ? 'text-red-400' : 'text-amber-400')
                  : (isDark ? 'text-dark-500' : 'text-gray-400')
                }
              `}>
                {tempObjective.length}/500
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                Describe your career goals and what you're looking for in your next role
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancelObjective}
                  disabled={savingObjective}
                  className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveObjective}
                  disabled={savingObjective}
                  className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                >
                  {savingObjective ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {objectiveSummary ? (
              <p className={`leading-relaxed ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                {objectiveSummary}
              </p>
            ) : (
              <div className={`
                p-4 rounded-xl border-2 border-dashed text-center
                ${isDark ? 'border-dark-600 bg-dark-700/30' : 'border-gray-200 bg-gray-50/50'}
              `}>
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                  No objective summary yet.
                </p>
                <button
                  onClick={handleEditObjective}
                  className="mt-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                  + Add your career objectives
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-4">
        <DataSourceIndicator isRealData={false} className="mb-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FileText}
          label="Applications"
          value={applications.total}
          color="primary"
        />
        <StatsCard
          icon={Clock}
          label="Pending"
          value={applications.pending}
          color="amber"
        />
        <StatsCard
          icon={CheckCircle}
          label="Accepted"
          value={applications.accepted}
          color="green"
        />
        <StatsCard
          icon={TrendingUp}
          label="Profile Views"
          value="84"
          color="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Education Section */}
          <SectionCard
            icon={GraduationCap}
            title="Education"
            isRealData={isProfileFromApi}
            action={
              <button
                onClick={educationModal.open}
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            }
          >
            {educationList.items.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                message="No education history added yet"
                action={
                  <button
                    onClick={educationModal.open}
                    className="btn-secondary"
                  >
                    Add Education
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {/* Education Items - Paginated with smooth transitions */}
                <div
                  key={`edu-page-${educationPagination.page}`}
                  className="space-y-3 animate-fade-slide-in"
                >
                  {(educationPagination.paginatedData || []).map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 80}ms`,
                        animationFillMode: 'backwards'
                      }}
                    >
                      <EducationItem
                        item={item}
                        onEdit={(item) => {
                          setEditingEducationId(item.id);
                          educationForm.setValues(item);
                          educationModal.open();
                        }}
                        onDelete={handleDeleteEducation}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination - Only show if more than 1 page */}
                {educationPagination.totalPages > 1 && (
                  <div className={`pt-3 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                    <Pagination
                      page={educationPagination.page}
                      totalPages={educationPagination.totalPages}
                      onPageChange={educationPagination.goToPage}
                      totalItems={educationPagination.totalItems}
                      pageSize={educationPagination.pageSize}
                      size="compact"
                      showFirstLast={false}
                      showInfo={true}
                    />
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Experience Section */}
          <SectionCard
            icon={Briefcase}
            title="Work Experience"
            isRealData={isProfileFromApi}
            action={
              <button
                onClick={experienceModal.open}
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            }
          >
            {experienceList.items.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                message="No work experience added yet"
                action={
                  <button
                    onClick={experienceModal.open}
                    className="btn-secondary"
                  >
                    Add Experience
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {/* Experience Items - Paginated with smooth transitions */}
                <div
                  key={`exp-page-${experiencePagination.page}`}
                  className="space-y-3 animate-fade-slide-in"
                >
                  {(experiencePagination.paginatedData || []).map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 80}ms`,
                        animationFillMode: 'backwards'
                      }}
                    >
                      <ExperienceItem
                        item={item}
                        onEdit={(item) => {
                          setEditingExperienceId(item.id);
                          experienceForm.setValues(item);
                          experienceModal.open();
                        }}
                        onDelete={handleDeleteExperience}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination - Only show if more than 1 page */}
                {experiencePagination.totalPages > 1 && (
                  <div className={`pt-3 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                    <Pagination
                      page={experiencePagination.page}
                      totalPages={experiencePagination.totalPages}
                      onPageChange={experiencePagination.goToPage}
                      totalItems={experiencePagination.totalItems}
                      pageSize={experiencePagination.pageSize}
                      size="compact"
                      showFirstLast={false}
                      showInfo={true}
                    />
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Section */}
          <SectionCard
            icon={Code}
            title="Skills"
            isRealData={isProfileFromApi}
            action={
              <button
                onClick={skillsModal.open}
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            }
          >
            {skills.length === 0 ? (
              <EmptyState
                icon={Code}
                message="No skills added yet"
                action={
                  <button
                    onClick={skillsModal.open}
                    className="btn-secondary btn-sm"
                  >
                    Add Skills
                  </button>
                }
              />
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 6).map((skill) => (
                    <SkillTag
                      key={skill}
                      skill={skill}
                      onRemove={handleRemoveSkill}
                    />
                  ))}
                </div>
                {skills.length > 6 && (
                  <button
                    onClick={() => setViewAllSkillsOpen(true)}
                    className={`
                      mt-4 group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-300 ease-out
                      ${isDark
                        ? 'bg-gradient-to-r from-dark-700/80 to-dark-600/60 hover:from-primary-500/20 hover:to-accent-500/20 text-dark-300 hover:text-white border border-dark-600 hover:border-primary-500/50'
                        : 'bg-gradient-to-r from-gray-100 to-gray-50 hover:from-primary-50 hover:to-accent-50 text-gray-600 hover:text-primary-600 border border-gray-200 hover:border-primary-300'
                      }
                      hover:shadow-lg hover:scale-[1.02]
                    `}
                  >
                    <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>View All Skills</span>
                    <span className={`
                      px-2 py-0.5 rounded-lg text-xs font-bold
                      ${isDark
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'bg-primary-100 text-primary-600'
                      }
                    `}>
                      {skills.length}
                    </span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </>
            )}
          </SectionCard>

          {/* Portfolio Section */}
          <SectionCard
            icon={Award}
            title="Portfolio"
            isRealData={false}
            action={
              <button className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                <Plus className="w-4 h-4" />
                Upload
              </button>
            }
          >
            <EmptyState
              icon={Award}
              message="No portfolio items yet"
              action={
                <button className="btn-secondary btn-sm">
                  Upload Portfolio
                </button>
              }
            />
          </SectionCard>

          {/* Quick Links */}
          <div className={`
            p-6 rounded-2xl border
            ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
          `}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard/jobs')}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isDark
                    ? 'bg-dark-700/50 hover:bg-dark-700 text-dark-300 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Briefcase className="w-5 h-5" />
                <span>Find Jobs</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </button>
              <button
                onClick={() => navigate('/dashboard/applications')}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isDark
                    ? 'bg-dark-700/50 hover:bg-dark-700 text-dark-300 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <FileText className="w-5 h-5" />
                <span>My Applications</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === MODALS using Headless Modal Hook === */}

      {/* Education Modal */}
      <Modal
        isOpen={educationModal.isOpen}
        onClose={educationModal.close}
        title="Add Education"
      >
        <form onSubmit={educationForm.handleSubmit} className="space-y-4">
          <FormInput
            label="Degree"
            name="degree"
            placeholder="Bachelor of Software Engineering"
            value={educationForm.values.degree}
            onChange={educationForm.handleChange}
            onBlur={educationForm.handleBlur}
            error={educationForm.touched.degree && educationForm.errors.degree}
            required
            variant={isDark ? 'dark' : 'light'}
          />
          <FormInput
            label="Institution"
            name="institution"
            placeholder="RMIT University"
            value={educationForm.values.institution}
            onChange={educationForm.handleChange}
            onBlur={educationForm.handleBlur}
            error={educationForm.touched.institution && educationForm.errors.institution}
            required
            variant={isDark ? 'dark' : 'light'}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Year"
              name="startYear"
              type="number"
              placeholder="2020"
              value={educationForm.values.startYear}
              onChange={educationForm.handleChange}
              onBlur={educationForm.handleBlur}
              error={educationForm.touched.startYear && educationForm.errors.startYear}
              required
              variant={isDark ? 'dark' : 'light'}
            />
            <FormInput
              label="End Year"
              name="endYear"
              type="number"
              placeholder="2024 or leave empty"
              value={educationForm.values.endYear}
              onChange={educationForm.handleChange}
              onBlur={educationForm.handleBlur}
              variant={isDark ? 'dark' : 'light'}
            />
          </div>
          <FormInput
            label="GPA (optional)"
            name="gpa"
            type="number"
            step="0.1"
            placeholder="3.5"
            value={educationForm.values.gpa}
            onChange={educationForm.handleChange}
            variant={isDark ? 'dark' : 'light'}
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={educationModal.close}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={educationForm.isSubmitting}
            >
              {educationForm.isSubmitting ? 'Saving...' : 'Save Education'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Experience Modal */}
      <Modal
        isOpen={experienceModal.isOpen}
        onClose={experienceModal.close}
        title="Add Work Experience"
      >
        <form onSubmit={experienceForm.handleSubmit} className="space-y-4">
          <FormInput
            label="Job Title"
            name="title"
            placeholder="Software Engineer"
            value={experienceForm.values.title}
            onChange={experienceForm.handleChange}
            onBlur={experienceForm.handleBlur}
            error={experienceForm.touched.title && experienceForm.errors.title}
            required
            variant={isDark ? 'dark' : 'light'}
          />
          <FormInput
            label="Company"
            name="company"
            placeholder="Google, VNG, FPT..."
            value={experienceForm.values.company}
            onChange={experienceForm.handleChange}
            onBlur={experienceForm.handleBlur}
            error={experienceForm.touched.company && experienceForm.errors.company}
            required
            variant={isDark ? 'dark' : 'light'}
          />
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              name="startDate"
              placeholder="MM/YYYY"
              value={experienceForm.values.startDate}
              onChange={experienceForm.handleChange}
              error={experienceForm.touched.startDate && experienceForm.errors.startDate}
              required
              showDayPicker={false}
              max={new Date().toISOString().slice(0, 7)}
              variant={isDark ? 'dark' : 'light'}
            />
            <DatePicker
              label="End Date"
              name="endDate"
              placeholder="MM/YYYY"
              value={experienceForm.values.isCurrentlyWorking ? '' : experienceForm.values.endDate}
              onChange={experienceForm.handleChange}
              error={experienceForm.touched.endDate && experienceForm.errors.endDate}
              disabled={experienceForm.values.isCurrentlyWorking}
              showDayPicker={false}
              min={experienceForm.values.startDate || undefined}
              max={new Date().toISOString().slice(0, 7)}
              variant={isDark ? 'dark' : 'light'}
              className={experienceForm.values.isCurrentlyWorking ? 'opacity-50' : ''}
            />
          </div>

          {/* Currently Working Checkbox */}
          <label className={`
            flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
            ${experienceForm.values.isCurrentlyWorking
              ? isDark
                ? 'bg-accent-500/10 border border-accent-500/30'
                : 'bg-accent-50 border border-accent-200'
              : isDark
                ? 'bg-dark-700/50 border border-dark-600 hover:border-dark-500'
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
            }
          `}>
            <div className="relative">
              <input
                type="checkbox"
                name="isCurrentlyWorking"
                checked={experienceForm.values.isCurrentlyWorking}
                onChange={(e) => {
                  experienceForm.handleChange(e);
                  // Clear end date error when toggling
                  if (e.target.checked) {
                    experienceForm.setFieldValue('endDate', '');
                  }
                }}
                className="sr-only"
              />
              <div className={`
                w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                ${experienceForm.values.isCurrentlyWorking
                  ? 'bg-accent-500 border-accent-500'
                  : isDark
                    ? 'border-dark-500 bg-dark-700'
                    : 'border-gray-300 bg-white'
                }
              `}>
                {experienceForm.values.isCurrentlyWorking && (
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                I currently work here
              </span>
              {experienceForm.values.isCurrentlyWorking && (
                <p className={`text-xs mt-0.5 ${isDark ? 'text-accent-400' : 'text-accent-600'}`}>
                  This is your current position
                </p>
              )}
            </div>
            {experienceForm.values.isCurrentlyWorking && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                <span className={`text-xs font-medium ${isDark ? 'text-accent-400' : 'text-accent-600'}`}>
                  Active
                </span>
              </div>
            )}
          </label>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe your responsibilities and achievements..."
              value={experienceForm.values.description}
              onChange={experienceForm.handleChange}
              className={`
                w-full px-4 py-3 border rounded-lg resize-none transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${isDark
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }
              `}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={experienceModal.close}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={experienceForm.isSubmitting}
            >
              {experienceForm.isSubmitting ? 'Saving...' : 'Save Experience'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Skills Modal - Enhanced with categories and smart suggestions */}
      <Modal
        isOpen={skillsModal.isOpen}
        onClose={skillsModal.close}
        title="Manage Skills"
      >
        <div className="space-y-5">
          {/* Custom Skill Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type to search or add custom skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className={`
                  w-full px-4 py-3 border rounded-xl transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${isDark
                    ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }
                `}
              />
              {/* Search suggestions dropdown */}
              {newSkill.trim() && searchSkills(newSkill).length > 0 && (
                <div className={`
                  absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden
                  ${isDark ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'}
                `}>
                  {searchSkills(newSkill).filter(s => !skills.includes(s.name)).slice(0, 5).map(suggestion => (
                    <button
                      key={suggestion.name}
                      onClick={() => {
                        if (!skills.includes(suggestion.name)) {
                          handleAddSkill(suggestion.name);
                          setNewSkill('');
                        }
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isDark
                          ? 'hover:bg-dark-600 text-white'
                          : 'hover:bg-gray-50 text-gray-900'
                        }
                      `}
                    >
                      <SkillIcon skill={suggestion.name} size="w-5 h-5" />
                      <span className="font-medium">{suggestion.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleAddSkill()}
              disabled={skillSaving || !newSkill.trim()}
              className={`
                px-5 py-3 rounded-xl font-medium transition-all duration-200
                ${skillSaving || !newSkill.trim()
                  ? 'bg-dark-600 text-dark-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:scale-105'
                }
              `}
            >
              {skillSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {/* Quick Add Popular Skills */}
          <div>
            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
              🔥 Quick Add Popular Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {getQuickAddSkills().filter(s => !skills.includes(s.name)).slice(0, 8).map(skill => (
                <button
                  key={skill.name}
                  onClick={() => handleAddSkill(skill.name)}
                  className={`
                    inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium
                    transition-all duration-200 hover:scale-105 hover:shadow-md
                    ${isDark
                      ? 'bg-dark-700/50 border-dark-600 text-dark-200 hover:border-primary-500/50 hover:bg-primary-500/10'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                    }
                  `}
                >
                  <SkillIcon skill={skill.name} size="w-4 h-4" />
                  <span>{skill.name}</span>
                  <Plus className="w-3.5 h-3.5 text-primary-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs with Skills - Redesigned */}
          <div>
            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
              📂 Browse by Category
            </p>
            <div className={`
              rounded-2xl border overflow-hidden shadow-sm
              ${isDark ? 'bg-dark-700/30 border-dark-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}
            `}>
              {/* Category pills - Clickable filters */}
              <div className={`flex flex-wrap gap-2 p-4 border-b ${isDark ? 'border-dark-600' : 'border-gray-100'}`}>
                {/* All category button */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`
                    inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                    transition-all duration-200 hover:scale-105
                    ${selectedCategory === 'all'
                      ? (isDark
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30')
                      : (isDark
                        ? 'bg-dark-600/50 text-dark-300 hover:bg-dark-500/50'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300')
                    }
                  `}
                >
                  ✨ All
                </button>
                {Object.entries(SKILL_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`
                      inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                      transition-all duration-200 hover:scale-105
                      ${selectedCategory === key
                        ? (isDark
                          ? `bg-gradient-to-r ${cat.bgColor} text-white shadow-lg`
                          : `bg-gradient-to-r ${cat.bgColor} text-white shadow-lg`)
                        : (isDark
                          ? 'bg-dark-600/50 text-dark-300 hover:bg-dark-500/50'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300')
                      }
                    `}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              {/* Skills grid - Filtered by category */}
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {(selectedCategory === 'all'
                    ? Object.values(POPULAR_SKILLS).flat()
                    : POPULAR_SKILLS[selectedCategory] || []
                  ).filter(s => !skills.includes(s.name)).map(skill => (
                    <button
                      key={skill.name}
                      onClick={() => handleAddSkill(skill.name)}
                      className={`
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium
                        transition-all duration-200 hover:scale-105 hover:shadow-md
                        ${isDark
                          ? 'bg-dark-600/50 text-dark-200 hover:bg-primary-500/20 hover:text-primary-300 border border-dark-500/50'
                          : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-300'
                        }
                      `}
                    >
                      <SkillIcon skill={skill.name} size="w-4 h-4" />
                      <span>{skill.name}</span>
                      <Plus className="w-3 h-3 opacity-50" />
                    </button>
                  ))}
                  {(selectedCategory === 'all'
                    ? Object.values(POPULAR_SKILLS).flat()
                    : POPULAR_SKILLS[selectedCategory] || []
                  ).filter(s => !skills.includes(s.name)).length === 0 && (
                      <p className={`text-sm italic ${isDark ? 'text-dark-400' : 'text-gray-400'}`}>
                        All skills from this category have been added! 🎉
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Skills */}
          {skills.length > 0 && (
            <div className={`pt-4 border-t ${isDark ? 'border-dark-600' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                ✨ Your Skills ({skills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <SkillTag
                    key={skill}
                    skill={skill}
                    onRemove={handleRemoveSkill}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={skillsModal.close}
              className={`
                px-6 py-2.5 rounded-xl font-medium transition-all duration-200
                bg-gradient-to-r from-primary-500 to-primary-600 text-white
                hover:shadow-lg hover:scale-105
              `}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Icon Picker Modal for Custom Skills */}
      {iconPicker.isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-fade-in"
            onClick={() => setIconPicker({ isOpen: false, skillName: '', pendingAdd: false })}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div
              className={`
                rounded-2xl shadow-2xl w-full max-w-md animate-scale-in border
                max-h-[80vh] flex flex-col overflow-hidden
                ${isDark
                  ? 'bg-dark-800 border-dark-700'
                  : 'bg-white border-gray-200'
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b flex-shrink-0 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Choose Icon for "{iconPicker.skillName}"
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    Select an icon that represents this skill
                  </p>
                </div>
                <button
                  onClick={() => setIconPicker({ isOpen: false, skillName: '', pendingAdd: false })}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-600' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Icon Grid */}
              <div className="p-5 overflow-y-auto flex-1">
                <div className="grid grid-cols-6 gap-3">
                  {Object.entries(SKILL_ICONS).filter(([key]) => key !== 'default').map(([key, icon]) => (
                    <button
                      key={key}
                      onClick={() => confirmAddSkill(iconPicker.skillName, key)}
                      disabled={skillSaving}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200
                        hover:scale-110 hover:shadow-lg
                        ${isDark
                          ? 'bg-dark-700 border-dark-600 hover:border-primary-500 hover:bg-primary-500/20'
                          : 'bg-gray-50 border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                        }
                        ${skillSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      title={key}
                    >
                      <span className="w-6 h-6 block">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-between p-4 border-t flex-shrink-0 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => confirmAddSkill(iconPicker.skillName, 'default')}
                  disabled={skillSaving}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${isDark ? 'text-dark-300 hover:text-white hover:bg-dark-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                    ${skillSaving ? 'opacity-50' : ''}
                  `}
                >
                  {skillSaving ? 'Adding...' : 'Use Default Icon'}
                </button>
                <button
                  onClick={() => setIconPicker({ isOpen: false, skillName: '', pendingAdd: false })}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium
                    ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View All Skills Modal */}
      {viewAllSkillsOpen && (
        <>
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[55] animate-fade-in"
            onClick={() => setViewAllSkillsOpen(false)}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[55] p-4">
            <div
              className={`
                rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in border
                max-h-[85vh] flex flex-col overflow-hidden
                ${isDark
                  ? 'bg-gradient-to-br from-dark-800 via-dark-800 to-dark-900 border-dark-600'
                  : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200'
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient accent */}
              <div className={`
                relative p-6 flex-shrink-0
                ${isDark ? 'bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-transparent' : 'bg-gradient-to-r from-primary-50 via-accent-50 to-transparent'}
              `}>
                {/* Decorative sparkles */}
                <div className="absolute top-4 right-16 opacity-50">
                  <Sparkles className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br from-primary-500 to-accent-500
                      shadow-lg shadow-primary-500/25
                    `}>
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        All Skills
                      </h3>
                      <p className={`text-sm mt-0.5 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                        {skills.length} skills in your profile
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewAllSkillsOpen(false)}
                    className={`
                      p-2.5 rounded-xl transition-all duration-200
                      ${isDark
                        ? 'text-dark-400 hover:text-white hover:bg-dark-600'
                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-200'
                      }
                    `}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <div
                      key={skill}
                      className={`
                        group relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                        border transition-all duration-300 ease-out
                        animate-fade-in hover:scale-105 hover:shadow-lg
                        ${isDark
                          ? 'bg-dark-700/80 border-dark-600 hover:border-primary-500/50 hover:bg-dark-600/80'
                          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 shadow-sm'
                        }
                      `}
                      style={{
                        animationDelay: `${index * 30}ms`,
                        animationFillMode: 'backwards'
                      }}
                    >
                      <SkillIcon skill={skill} size="w-5 h-5" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {skill}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSkill(skill);
                        }}
                        className={`
                          ml-1 p-1 rounded-lg transition-all duration-200
                          opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0
                          ${isDark
                            ? 'text-dark-400 hover:text-red-400 hover:bg-red-500/20'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }
                        `}
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className={`
                flex items-center justify-between p-5 border-t flex-shrink-0
                ${isDark ? 'border-dark-700 bg-dark-800/50' : 'border-gray-200 bg-gray-50/50'}
              `}>
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                  Click on a skill to remove it from your profile
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setViewAllSkillsOpen(false);
                      skillsModal.open();
                    }}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isDark
                        ? 'text-dark-300 hover:text-white hover:bg-dark-600 border border-dark-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 border border-gray-300'
                      }
                    `}
                  >
                    <Plus className="w-4 h-4" />
                    Add More Skills
                  </button>
                  <button
                    onClick={() => setViewAllSkillsOpen(false)}
                    className={`
                      px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      bg-gradient-to-r from-primary-500 to-primary-600 text-white
                      hover:shadow-lg hover:shadow-primary-500/25 hover:scale-105
                    `}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={deleteDialog.title}
        message={deleteDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteDialog.loading}
      />
    </div>
  );
}
