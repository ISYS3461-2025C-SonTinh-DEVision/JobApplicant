/**
 * Dashboard Home Page
 * 
 * Main dashboard overview with:
 * - Quick stats
 * - Recent applications
 * - Quick actions
 * - Activity feed
 * 
 * Architecture:
 * - Uses reusable components
 * - Responsive grid layout
 * - Smooth animations
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Search, FileText, TrendingUp,
  Plus, ArrowRight, Clock, CheckCircle, XCircle,
  Bell, Crown
} from 'lucide-react';
import { Card } from '../../components/reusable';
import { useAuth } from '../../hooks/useAuth';

/**
 * Quick Stats Card
 */
function QuickStatsCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  };

  return (
    <Card variant="dark" className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-dark-400">{label}</p>
    </Card>
  );
}

/**
 * Quick Action Button
 */
function QuickActionButton({ icon: Icon, label, onClick, variant = 'default' }) {
  const variants = {
    default: 'bg-dark-700 hover:bg-dark-600 text-white',
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
 * Recent Application Item
 */
function RecentApplicationItem({ application }) {
  const statusConfig = {
    PENDING: { icon: Clock, color: 'amber', label: 'Pending' },
    REVIEWING: { icon: Clock, color: 'blue', label: 'Reviewing' },
    ACCEPTED: { icon: CheckCircle, color: 'green', label: 'Accepted' },
    REJECTED: { icon: XCircle, color: 'red', label: 'Rejected' },
  };

  const status = statusConfig[application.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-dark-700/50 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
        <Briefcase className="w-6 h-6 text-primary-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{application.jobTitle}</h4>
        <p className="text-sm text-dark-400">{application.company}</p>
        <p className="text-xs text-dark-500 mt-1">{application.appliedDate}</p>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${status.color}-500/20 text-${status.color}-400`}>
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
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-dark-400 mt-1">{description}</p>
        <p className="text-xs text-dark-500 mt-1">{time}</p>
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

  // Mock data (will be replaced with real data from API)
  const recentApplications = [
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
  ];

  const activities = [
    {
      icon: FileText,
      title: 'Application submitted',
      description: 'Applied for Senior Frontend Developer at Tech Corp',
      time: '2 hours ago'
    },
    {
      icon: Bell,
      title: 'New job match',
      description: 'React Developer position matches your skills',
      time: '5 hours ago'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome back, {currentUser?.firstName || 'User'}! 👋
        </h1>
        <p className="text-dark-400">
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatsCard 
          icon={FileText}
          label="Total Applications"
          value="12"
          trend={+15}
          color="primary"
        />
        <QuickStatsCard 
          icon={Clock}
          label="Pending"
          value="5"
          color="amber"
        />
        <QuickStatsCard 
          icon={CheckCircle}
          label="Accepted"
          value="3"
          trend={+50}
          color="green"
        />
        <QuickStatsCard 
          icon={TrendingUp}
          label="Profile Views"
          value="84"
          trend={+12}
          color="accent"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications */}
          <Card variant="dark" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
              <button
                onClick={() => navigate('/dashboard/applications')}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentApplications.length > 0 ? (
                recentApplications.map(app => (
                  <RecentApplicationItem key={app.id} application={app} />
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400 mb-4">No applications yet</p>
                  <button
                    onClick={() => navigate('/dashboard/jobs')}
                    className="btn-primary"
                  >
                    Find Jobs
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Activity Feed */}
          <Card variant="dark" className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="dark" className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
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
          </Card>

          {/* Premium Upgrade */}
          <Card variant="dark" className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upgrade to Premium</h3>
              <p className="text-sm text-dark-300 mb-4">
                Get real-time job alerts and unlimited applications
              </p>
              <button
                onClick={() => navigate('/dashboard/subscription')}
                className="btn-primary w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              >
                Learn More
              </button>
            </div>
          </Card>

          {/* Profile Completion */}
          <Card variant="dark" className="p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Profile Completion</h3>
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-dark-400">65% Complete</span>
                <span className="text-primary-400 font-medium">65%</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
            <p className="text-xs text-dark-400 mb-3">
              Add skills and experience to improve your profile
            </p>
            <button
              onClick={() => navigate('/dashboard/profile/edit')}
              className="btn-secondary btn-sm w-full"
            >
              Complete Profile
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

