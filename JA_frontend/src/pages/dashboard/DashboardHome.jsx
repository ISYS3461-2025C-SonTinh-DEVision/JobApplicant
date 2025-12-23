/**
 * Dashboard Home Page
 * 
 * Main dashboard overview with:
 * - Quick stats
 * - Recent applications
 * - Quick actions
 * - Activity feed
 * - Light/Dark mode support
 * - Headless UI integration
 * 
 * Architecture: A.2.b Componentized Frontend + A.3.a Headless UI
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Search, FileText, TrendingUp,
  Plus, ArrowRight, Clock, CheckCircle, XCircle,
  Bell, Crown, Eye, BarChart2
} from 'lucide-react';
import { Card } from '../../components/reusable';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useHeadlessTabs, useHeadlessDataList } from '../../components/headless';

/**
 * Quick Stats Card with theme support
 */
function QuickStatsCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const { isDark } = useTheme();

  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  };

  return (
    <div className={`
      p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg
      ${isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
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
 * Recent Application Item using headless data list
 */
function RecentApplicationItem({ application }) {
  const { isDark } = useTheme();

  const statusConfig = {
    PENDING: { icon: Clock, color: 'amber', label: 'Pending' },
    REVIEWING: { icon: Eye, color: 'blue', label: 'Reviewing' },
    ACCEPTED: { icon: CheckCircle, color: 'green', label: 'Accepted' },
    REJECTED: { icon: XCircle, color: 'red', label: 'Rejected' },
  };

  const status = statusConfig[application.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  const colorClasses = {
    amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
    blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
    green: isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
    red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
  };

  return (
    <div className={`
      flex items-start gap-4 p-4 rounded-lg transition-colors
      ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'}
    `}>
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
function ActivityItem({ icon: Icon, title, description, time }) {
  const { isDark } = useTheme();

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary-400" />
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
 * Dashboard Home Page
 */
export default function DashboardHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Mock data (will be replaced with real data from API)
  const allApplications = useMemo(() => [
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'Tech Corp Vietnam',
      appliedDate: '2 days ago',
      status: 'PENDING'
    },
    {
      id: '2',
      jobTitle: 'Full Stack Engineer',
      company: 'Startup Hub',
      appliedDate: '5 days ago',
      status: 'REVIEWING'
    },
    {
      id: '3',
      jobTitle: 'React Developer',
      company: 'Digital Agency',
      appliedDate: '1 week ago',
      status: 'ACCEPTED'
    },
    {
      id: '4',
      jobTitle: 'Backend Engineer',
      company: 'Fintech Solutions',
      appliedDate: '2 weeks ago',
      status: 'REJECTED'
    },
  ], []);

  // Use headless data list for applications
  const {
    items: recentApplications,
    setFilter,
    currentFilter
  } = useHeadlessDataList({
    initialItems: allApplications,
    filters: {
      all: () => true,
      pending: (item) => item.status === 'PENDING',
      reviewing: (item) => item.status === 'REVIEWING',
      completed: (item) => ['ACCEPTED', 'REJECTED'].includes(item.status),
    },
    initialFilter: 'all',
    pageSize: 3
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

  const activities = useMemo(() => {
    const allActivities = [
      {
        type: 'applications',
        icon: FileText,
        title: 'Application submitted',
        description: 'Applied for Senior Frontend Developer at Tech Corp',
        time: '2 hours ago'
      },
      {
        type: 'applications',
        icon: Bell,
        title: 'New job match',
        description: 'React Developer position matches your skills',
        time: '5 hours ago'
      },
      {
        type: 'profile',
        icon: CheckCircle,
        title: 'Profile updated',
        description: 'Added new skills: React, TypeScript',
        time: '1 day ago'
      },
    ];

    if (activityTabs.activeTab === 'all') return allActivities;
    return allActivities.filter(a => a.type === activityTabs.activeTab);
  }, [activityTabs.activeTab]);

  // Mock stats data
  const stats = {
    totalApplications: 12,
    pending: 5,
    accepted: 3,
    profileViews: 84,
    applicationsTrend: 15,
    acceptedTrend: 50,
    profileViewsTrend: 12
  };

  // Profile completion percentage
  const profileCompletion = 65;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Welcome back, {currentUser?.firstName || 'User'}! 👋
        </h1>
        <p className={isDark ? 'text-dark-400' : 'text-gray-500'}>
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatsCard
          icon={FileText}
          label="Total Applications"
          value={stats.totalApplications}
          trend={stats.applicationsTrend}
          color="primary"
        />
        <QuickStatsCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          color="amber"
        />
        <QuickStatsCard
          icon={CheckCircle}
          label="Accepted"
          value={stats.accepted}
          trend={stats.acceptedTrend}
          color="green"
        />
        <QuickStatsCard
          icon={TrendingUp}
          label="Profile Views"
          value={stats.profileViews}
          trend={stats.profileViewsTrend}
          color="accent"
        />
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
              {recentApplications.length > 0 ? (
                recentApplications.slice(0, 3).map(app => (
                  <RecentApplicationItem key={app.id} application={app} />
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-dark-500' : 'text-gray-300'}`} />
                  <p className={`mb-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>No applications yet</p>
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
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
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
            </div>
          </div>

          {/* Premium Upgrade */}
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

          {/* Profile Completion */}
          <div className={`
            rounded-2xl border p-6
            ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
          `}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Profile Completion
            </h3>
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className={isDark ? 'text-dark-400' : 'text-gray-500'}>{profileCompletion}% Complete</span>
                <span className="text-primary-400 font-medium">{profileCompletion}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
            <p className={`text-xs mb-3 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
              Add skills and experience to improve your profile
            </p>
            <button
              onClick={() => navigate('/dashboard/profile/edit')}
              className={`
                w-full px-4 py-2 text-sm font-medium rounded-xl transition-colors
                ${isDark
                  ? 'bg-dark-700 text-white hover:bg-dark-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }
              `}
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
