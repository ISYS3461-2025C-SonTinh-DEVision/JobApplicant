/**
 * Dashboard Home Page
 * 
 * Main dashboard overview with:
 * - Real stats from /api/applications/history
 * - Real recent applications from /api/applications/my-applications
 * - Smart profile completion calculation
 * - Light/Dark mode support
 * - Headless UI integration (A.3.a Ultimo)
 * - Real-time notifications integration
 * 
 * Architecture: A.2.b Componentized Frontend + A.3.a Headless UI
 */

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Search, FileText, TrendingUp,
  Plus, ArrowRight, Clock, CheckCircle, XCircle,
  Bell, Crown, Eye, Sparkles, RefreshCw, AlertCircle,
  User, Award, BookOpen, Phone
} from 'lucide-react';
import { Card as HeadlessCard, useCard } from '../../components/headless';
import { useHeadlessTabs, useHeadlessDataList } from '../../components/headless';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import useDashboardData from '../../hooks/useDashboardData';
import { DashboardService } from '../../services/DashboardService';

/**
 * Skeleton loader component for stats cards
 */
function StatsSkeleton() {
  const { isDark } = useTheme();
  return (
    <div className={`
      p-6 rounded-2xl border animate-pulse
      ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
      </div>
      <div className={`h-8 w-16 rounded mb-2 ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
      <div className={`h-4 w-24 rounded ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
    </div>
  );
}

/**
 * Quick Stats Card with headless Card hook for hover effects
 */
function QuickStatsCard({ icon: Icon, label, value, trend, color = 'primary', onClick }) {
  const { isDark } = useTheme();

  // Use headless card hook for hover state management
  const { isHovered, getCardProps } = useCard({
    item: { label, value },
    onView: onClick,
  });

  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
    red: 'from-red-500/20 to-red-600/20 text-red-400',
  };

  return (
    <div
      {...getCardProps()}
      onClick={onClick}
      className={`
        p-6 rounded-2xl border transition-all duration-200 cursor-pointer
        ${isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm'}
        ${isDark
          ? 'bg-dark-800 border-dark-700 hover:border-dark-600'
          : 'bg-white border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0
            ? 'bg-green-500/20 text-green-400'
            : trend < 0
              ? 'bg-red-500/20 text-red-400'
              : isDark ? 'bg-dark-600 text-dark-300' : 'bg-gray-100 text-gray-500'
            }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{label}</p>
    </div>
  );
}

/**
 * Quick Action Button
 */
function QuickActionButton({ icon: Icon, label, onClick, variant = 'default' }) {
  const { isDark } = useTheme();

  const variants = {
    default: isDark
      ? 'bg-dark-700 hover:bg-dark-600 text-white'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-glow',
    accent: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-4 py-3 rounded-xl
        transition-all duration-200 group
        ${variants[variant]}
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium flex-1 text-left">{label}</span>
      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

/**
 * Recent Application Item using headless Card
 */
function RecentApplicationItem({ application, onView }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const { getCardProps, isHovered } = useCard({
    item: application,
    onView: () => onView ? onView(application) : navigate(`/dashboard/applications/${application.id}`),
  });

  const statusConfig = {
    PENDING: { icon: Clock, color: 'amber', label: 'Pending' },
    REVIEWING: { icon: Eye, color: 'blue', label: 'Reviewing' },
    ACCEPTED: { icon: CheckCircle, color: 'green', label: 'Accepted' },
    REJECTED: { icon: XCircle, color: 'red', label: 'Rejected' },
    WITHDRAWN: { icon: XCircle, color: 'gray', label: 'Withdrawn' },
  };

  const status = statusConfig[application.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  const colorClasses = {
    amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
    blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
    green: isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
    red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
    gray: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700',
  };

  return (
    <div
      {...getCardProps()}
      className={`
        flex items-start gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer
        ${isHovered
          ? (isDark ? 'bg-dark-700' : 'bg-gray-50')
          : ''
        }
      `}
    >
      <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
        <Briefcase className="w-6 h-6 text-primary-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {application.jobTitle}
        </h4>
        <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{application.company}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>{application.appliedDate}</p>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[status.color]}`}>
        <StatusIcon className="w-3.5 h-3.5" />
        {status.label}
      </div>
    </div>
  );
}

/**
 * Activity Item
 */
function ActivityItem({ icon, title, description, time }) {
  const { isDark } = useTheme();

  // Map icon string to component
  const iconComponents = {
    FileText: FileText,
    Bell: Bell,
    CheckCircle: CheckCircle,
  };

  const IconComponent = typeof icon === 'string' ? iconComponents[icon] || FileText : icon;

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
        <IconComponent className="w-4 h-4 text-primary-400" />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{description}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>{time}</p>
      </div>
    </div>
  );
}

/**
 * Profile Completion Card with smart navigation
 * When clicking "Complete Profile", navigates to edit profile and highlights missing fields
 */
function ProfileCompletionCard({ completion, onComplete }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { percentage, missingFields } = completion;

  // Field mapping to section IDs in EditProfile
  const fieldToSectionMap = {
    avatar: 'avatar-section',
    objectiveSummary: 'objective-section',
    education: 'education-section',
    workExperience: 'experience-section',
    skills: 'skills-section',
    phoneNumber: 'contact-section',
    addressCity: 'contact-section',
  };

  // Icon mapping for missing fields
  const fieldIcons = {
    avatar: User,
    objectiveSummary: FileText,
    education: BookOpen,
    workExperience: Briefcase,
    skills: Award,
    phoneNumber: Phone,
    addressCity: Eye,
  };

  /**
   * Smart navigation handler - navigates to profile page with section highlighting
   * Highlights ALL missing sections with animations
   */
  const handleSmartComplete = useCallback(() => {
    // Consider profile complete if percentage >= 100 OR there are no missing fields
    const isProfileComplete = percentage >= 100 || missingFields.length === 0;

    // Always navigate to profile page (modals for adding are on the profile page)
    navigate('/dashboard/profile');

    if (isProfileComplete) {
      return; // Just view profile, no need to highlight anything
    }

    // Smart mapping for profile-header fields:
    // - If ONLY avatar is missing → highlight avatar-section
    // - If avatar exists but phone/address missing → highlight edit-profile-btn
    // - If both avatar AND phone/address missing → highlight profile-header (whole section)
    const hasAvatarMissing = missingFields.includes('avatar');
    const hasContactMissing = missingFields.includes('phoneNumber') || missingFields.includes('addressCity');

    // Map field names to section IDs with smart logic
    const getSectionId = (field) => {
      if (field === 'avatar') {
        // If only avatar is missing, highlight avatar upload area
        return hasContactMissing ? 'profile-header' : 'avatar-section';
      }
      if (field === 'phoneNumber' || field === 'addressCity') {
        // If avatar exists but contact info missing, highlight Edit Profile button
        return hasAvatarMissing ? 'profile-header' : 'edit-profile-btn';
      }
      // Other sections
      const sectionMap = {
        objectiveSummary: 'objective-section',
        education: 'education-section',
        workExperience: 'experience-section',
        skills: 'skills-section',
      };
      return sectionMap[field] || 'profile-header';
    };

    // Get unique section IDs for all missing fields
    const uniqueSectionIds = [...new Set(
      missingFields.map(field => getSectionId(field))
    )];

    // After navigation, scroll to first section and highlight ALL missing sections
    setTimeout(() => {
      // Scroll to the first missing section
      const firstSection = document.getElementById(uniqueSectionIds[0]);
      if (firstSection) {
        firstSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Highlight all missing sections with staggered animation
      uniqueSectionIds.forEach((sectionId, index) => {
        const element = document.getElementById(sectionId);
        if (element) {
          // Stagger the animation start slightly for visual effect
          setTimeout(() => {
            element.classList.add('animate-shake-attention');
            element.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');

            // Remove animation after 2 seconds
            setTimeout(() => {
              element.classList.remove('animate-shake-attention');
              element.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2');
            }, 2000);
          }, index * 150); // 150ms stagger between each section
        }
      });
    }, 500);
  }, [percentage, missingFields, navigate]);

  return (
    <div className={`
      rounded-2xl border p-6
      ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
    `}>
      <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Profile Completion
      </h3>
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className={isDark ? 'text-dark-400' : 'text-gray-500'}>
            {percentage}% Complete
          </span>
          <span className={percentage >= 80 ? 'text-green-400' : 'text-primary-400'} >
            {percentage >= 80 ? 'Great!' : percentage >= 50 ? 'Good progress' : 'Keep going'}
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${percentage >= 80
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-primary-500 to-primary-600'
              }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {missingFields.length > 0 && (
        <div className="mb-3">
          <p className={`text-xs mb-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
            Click a field to complete it:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingFields.slice(0, 3).map((field) => {
              const FieldIcon = fieldIcons[field] || FileText;
              // Smart section ID mapping for individual field clicks
              const getSectionIdForField = (f) => {
                if (f === 'avatar') return 'avatar-section';
                if (f === 'phoneNumber' || f === 'addressCity') return 'edit-profile-btn';
                const sectionMap = {
                  objectiveSummary: 'objective-section',
                  education: 'education-section',
                  workExperience: 'experience-section',
                  skills: 'skills-section',
                };
                return sectionMap[f] || 'profile-header';
              };
              const targetSectionId = getSectionIdForField(field);

              return (
                <button
                  key={field}
                  onClick={() => {
                    navigate('/dashboard/profile');
                    // After navigation, scroll to and highlight the section
                    setTimeout(() => {
                      const targetElement = document.getElementById(targetSectionId);
                      if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetElement.classList.add('animate-shake-attention');
                        targetElement.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');
                        setTimeout(() => {
                          targetElement.classList.remove('animate-shake-attention');
                          targetElement.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2');
                        }, 2000);
                      }
                    }, 500);
                  }}
                  className={`
                    inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full
                    cursor-pointer transition-all duration-200 hover:scale-105
                    ${isDark
                      ? 'bg-dark-700 text-dark-300 hover:bg-primary-500/20 hover:text-primary-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                    }
                  `}
                >
                  <FieldIcon className="w-3 h-3" />
                  {DashboardService.getFieldDisplayName(field)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={handleSmartComplete}
        className={`
          w-full px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200
          flex items-center justify-center gap-2
          ${isDark
            ? (percentage >= 100 || missingFields.length === 0)
              ? 'bg-dark-700 text-white hover:bg-dark-600'
              : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg hover:shadow-glow'
            : (percentage >= 100 || missingFields.length === 0)
              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg'
          }
        `}
      >
        <Sparkles className="w-4 h-4" />
        {(percentage >= 100 || missingFields.length === 0) ? 'View Profile' : 'Complete Profile Now'}
      </button>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ error, onRetry }) {
  const { isDark } = useTheme();

  return (
    <div className={`
      text-center py-12 px-6 rounded-2xl border
      ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}
    `}>
      <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Unable to load dashboard
      </h3>
      <p className={`text-sm mb-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
        {error || 'Something went wrong. Please try again.'}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

/**
 * Dashboard Home Page
 */
export default function DashboardHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { simulateNotification, showSuccess, unreadCount } = useNotifications();

  // Use dashboard data hook for real data
  const {
    stats,
    profileCompletion,
    recentApplications,
    recentActivity,
    subscription,
    isPremium,
    loading,
    error,
    refresh,
  } = useDashboardData();

  // Use headless data list for applications filtering
  const {
    items: filteredApplications,
    setFilter,
    currentFilter
  } = useHeadlessDataList({
    initialItems: recentApplications,
    filters: {
      all: () => true,
      pending: (item) => item.status === 'PENDING',
      reviewing: (item) => item.status === 'REVIEWING',
      completed: (item) => ['ACCEPTED', 'REJECTED'].includes(item.status),
    },
    initialFilter: 'all',
    pageSize: 5
  });

  // Use headless tabs for activity types
  const activityTabs = useHeadlessTabs({
    tabs: [
      { id: 'all', label: 'All Activity' },
      { id: 'applications', label: 'Applications' },
      { id: 'profile', label: 'Profile' },
    ],
    initialTab: 'all'
  });

  // Filter activities based on active tab
  const filteredActivities = useMemo(() => {
    if (activityTabs.activeTab === 'all') return recentActivity;
    return recentActivity.filter(a => a.type === activityTabs.activeTab);
  }, [activityTabs.activeTab, recentActivity]);

  // Handle view application
  const handleViewApplication = useCallback((app) => {
    navigate(`/dashboard/applications/${app.id}`);
  }, [navigate]);

  // Show error state
  if (error && !loading && recentApplications.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorState error={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header with Refresh */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {currentUser?.firstName || 'User'}! 👋
          </h1>
          <p className={isDark ? 'text-dark-400' : 'text-gray-500'}>
            Here's what's happening with your job search today.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className={`
            p-2 rounded-lg transition-colors
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDark ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'}
          `}
          title="Refresh dashboard"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
          </>
        ) : (
          <>
            <QuickStatsCard
              icon={FileText}
              label="Total Applications"
              value={stats.totalApplications}
              trend={stats.applicationsTrend}
              color="primary"
              onClick={() => navigate('/dashboard/applications')}
            />
            <QuickStatsCard
              icon={Clock}
              label="Pending"
              value={stats.pending}
              color="amber"
              onClick={() => navigate('/dashboard/applications?status=PENDING')}
            />
            <QuickStatsCard
              icon={CheckCircle}
              label="Accepted"
              value={stats.accepted}
              trend={stats.acceptedTrend}
              color="green"
              onClick={() => navigate('/dashboard/applications?status=ACCEPTED')}
            />
            <QuickStatsCard
              icon={XCircle}
              label="Rejected"
              value={stats.rejected}
              color="red"
              onClick={() => navigate('/dashboard/applications?status=REJECTED')}
            />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications with Filter */}
          <div className={`
            rounded-2xl border p-6
            ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
          `}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Applications
              </h2>
              <div className="flex items-center gap-2">
                {/* Filter buttons using headless data list */}
                <div className="flex gap-1">
                  {['all', 'pending', 'reviewing'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilter(filter)}
                      className={`
                        px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize
                        ${currentFilter === filter
                          ? 'bg-primary-600 text-white'
                          : isDark
                            ? 'text-dark-400 hover:text-white hover:bg-dark-700'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/dashboard/applications')}
                  className={`text-sm transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
                    }`}
                >
                  View All
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className={`text-center py-8 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                  Loading applications...
                </div>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.slice(0, 5).map(app => (
                  <RecentApplicationItem
                    key={app.id}
                    application={app}
                    onView={handleViewApplication}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-dark-500' : 'text-gray-300'}`} />
                  <p className={`mb-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    {recentApplications.length === 0
                      ? 'No applications yet'
                      : 'No applications match this filter'
                    }
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/jobs')}
                    className="btn-primary"
                  >
                    Find Jobs
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed with Tabs */}
          <div className={`
            rounded-2xl border p-6
            ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
          `}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h2>
              {/* Tab buttons using headless tabs */}
              <div className="flex gap-1">
                {activityTabs.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => activityTabs.setActiveTab(tab.id)}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-lg transition-colors
                      ${activityTabs.activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : isDark
                          ? 'text-dark-400 hover:text-white hover:bg-dark-700'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className={`text-center py-8 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                  Loading activity...
                </div>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((activity, index) => (
                  <ActivityItem key={`${activity.type}-${index}`} {...activity} />
                ))
              ) : (
                <p className={`text-center py-8 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                  No activity in this category
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Completion - moved to top for visibility */}
          <ProfileCompletionCard
            completion={profileCompletion}
            onComplete={() => navigate('/dashboard/profile/edit')}
          />

          {/* Quick Actions */}
          <div className={`
            rounded-2xl border p-6
            ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
          `}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <QuickActionButton
                icon={Search}
                label="Find Jobs"
                onClick={() => navigate('/dashboard/jobs')}
                variant="primary"
              />
              <QuickActionButton
                icon={Plus}
                label="Upload Resume"
                onClick={() => navigate('/dashboard/profile')}
              />
              <QuickActionButton
                icon={Briefcase}
                label="View Applications"
                onClick={() => navigate('/dashboard/applications')}
              />
              {/* Demo notification button - only for premium */}
              {isPremium && (
                <QuickActionButton
                  icon={Sparkles}
                  label="Demo Notification"
                  onClick={() => {
                    simulateNotification({
                      id: 'job_' + Date.now(),
                      title: 'Full Stack Developer',
                      company: 'TechCorp Vietnam',
                    });
                    showSuccess('Notification Sent!', 'Check the bell icon in the header');
                  }}
                  variant="accent"
                />
              )}
            </div>
          </div>

          {/* Premium Upgrade (for free users) */}
          {!isPremium && (
            <div className={`
              rounded-2xl p-6 border
              ${isDark
                ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20'
                : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
              }
            `}>
              <div className="text-center">
                <div className={`
                  w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
                  ${isDark ? 'bg-amber-500/20' : 'bg-amber-200'}
                `}>
                  <Crown className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Upgrade to Premium
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                  Get real-time job alerts and unlimited applications
                </p>
                <button
                  onClick={() => navigate('/dashboard/subscription')}
                  className="btn-primary w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                >
                  Learn More
                </button>
              </div>
            </div>
          )}

          {/* Premium Status (for premium users) */}
          {isPremium && (
            <div className={`
              rounded-2xl p-6 border
              ${isDark
                ? 'bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20'
                : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
              }
            `}>
              <div className="text-center">
                <div className={`
                  w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
                  ${isDark ? 'bg-green-500/20' : 'bg-green-200'}
                `}>
                  <Crown className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Premium Active
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                  You're receiving real-time job alerts!
                </p>
                <button
                  onClick={() => navigate('/dashboard/subscription')}
                  className={`
                    w-full px-4 py-2 text-sm font-medium rounded-xl transition-colors
                    ${isDark
                      ? 'bg-dark-700 text-white hover:bg-dark-600'
                      : 'bg-white/50 text-gray-900 hover:bg-white'
                    }
                  `}
                >
                  Manage Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
