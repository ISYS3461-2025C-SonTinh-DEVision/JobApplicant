/**
 * Admin Dashboard Page
 * Overview with statistics and recent activity
 * 
 * Uses: useHeadlessDataList for statistics display
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Building2,
    Briefcase,
    Activity,
    Crown,
    Clock,
    UserPlus,
    FileText,
    ArrowUpRight,
    RefreshCw,
    UserMinus,
    CheckCircle,
} from 'lucide-react';
import AdminService from '../../services/AdminService';

// Stat Card Component
function StatCard({ icon: Icon, title, value, subtitle, color = 'violet', loading = false }) {
    const colorClasses = {
        violet: 'from-violet-500 to-violet-600',
        pink: 'from-pink-500 to-pink-600',
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
    };

    return (
        <div className="glass-card p-4 sm:p-6 hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
            </div>
            <h3 className="text-dark-400 text-xs sm:text-sm font-medium mb-1">{title}</h3>
            {loading ? (
                <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
            ) : (
                <>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{value?.toLocaleString() || 0}</p>
                    {subtitle && <p className="text-xs text-dark-500 mt-1">{subtitle}</p>}
                </>
            )}
        </div>
    );
}

// Activity Item Component
function ActivityItem({ type, action, name, time, status }) {
    const icons = {
        applicant_registered: UserPlus,
        applicant_deactivated: UserMinus,
        job_posted: FileText,
        company_registered: Building2,
        status_changed: CheckCircle,
    };

    const colors = {
        applicant_registered: 'text-blue-400 bg-blue-500/20',
        applicant_deactivated: 'text-red-400 bg-red-500/20',
        job_posted: 'text-emerald-400 bg-emerald-500/20',
        company_registered: 'text-violet-400 bg-violet-500/20',
        status_changed: 'text-yellow-400 bg-yellow-500/20',
    };

    const Icon = icons[type] || Activity;

    return (
        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${colors[type] || 'text-gray-400 bg-gray-500/20'}`}>
                <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm sm:text-base truncate">{name}</p>
                <p className="text-dark-400 text-xs sm:text-sm">{action}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-dark-500 text-xs sm:text-sm flex-shrink-0">
                <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                <span>{time}</span>
            </div>
        </div>
    );
}

// Quick Action Button
function QuickAction({ icon: Icon, label, onClick, color = 'violet' }) {
    const colorClasses = {
        violet: 'text-violet-400 hover:border-violet-500/30',
        pink: 'text-pink-400 hover:border-pink-500/30',
        blue: 'text-blue-400 hover:border-blue-500/30',
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 ${colorClasses[color]} transition-all group w-full`}
        >
            <Icon className={`w-4 sm:w-5 h-4 sm:h-5 ${colorClasses[color].split(' ')[0]}`} />
            <span className="text-white font-medium text-sm sm:text-base">{label}</span>
            <ArrowUpRight className="w-4 h-4 ml-auto text-dark-500 group-hover:text-white transition-colors" />
        </button>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);

    // Generate recent activity based on current applicants data
    const generateRecentActivity = useCallback(async () => {
        try {
            const applicantsData = await AdminService.getApplicants({ page: 1, limit: 5 });
            const applicants = applicantsData.data || [];

            // Create activity items from applicants
            const activities = applicants.map((applicant, index) => {
                const createdDate = new Date(applicant.createdAt);
                const now = new Date();
                const diffHours = Math.floor((now - createdDate) / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);

                let timeStr = 'Just now';
                if (diffDays > 0) {
                    timeStr = `${diffDays}d ago`;
                } else if (diffHours > 0) {
                    timeStr = `${diffHours}h ago`;
                }

                // Determine type based on status
                const type = applicant.status === 'inactive'
                    ? 'applicant_deactivated'
                    : 'applicant_registered';

                const action = applicant.status === 'inactive'
                    ? 'Account deactivated'
                    : applicant.isPremium
                        ? 'Premium registration'
                        : 'New registration';

                return {
                    type,
                    action,
                    name: applicant.name,
                    time: timeStr,
                };
            });

            setRecentActivity(activities);
        } catch (error) {
            console.error('Failed to generate activity:', error);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await AdminService.getDashboardStats();
            setStats(data);
            await generateRecentActivity();
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    }, [generateRecentActivity]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Dashboard Overview</h1>
                    <p className="text-dark-400 text-sm sm:text-base">Welcome to the DEVision Admin Panel</p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard
                    icon={Users}
                    title="Total Applicants"
                    value={stats?.totalApplicants}
                    subtitle="Registered users"
                    color="violet"
                    loading={loading}
                />
                <StatCard
                    icon={Building2}
                    title="Total Companies"
                    value={stats?.totalCompanies}
                    subtitle="From Job Manager"
                    color="pink"
                    loading={loading}
                />
                <StatCard
                    icon={Briefcase}
                    title="Active Job Posts"
                    value={stats?.totalJobPosts}
                    subtitle="From Job Manager"
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    icon={Activity}
                    title="Active Users"
                    value={stats?.activeUsers}
                    subtitle="Enabled accounts"
                    color="emerald"
                    loading={loading}
                />
            </div>

            {/* Premium Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="glass-card p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-base sm:text-lg font-semibold text-white">Premium Subscriptions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 rounded-xl bg-white/5">
                            <p className="text-dark-400 text-xs sm:text-sm mb-1">Premium Applicants</p>
                            {loading ? (
                                <div className="h-7 w-12 bg-white/10 rounded animate-pulse" />
                            ) : (
                                <p className="text-xl sm:text-2xl font-bold text-white">{stats?.premiumApplicants || 0}</p>
                            )}
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-white/5">
                            <p className="text-dark-400 text-xs sm:text-sm mb-1">Premium Companies</p>
                            {loading ? (
                                <div className="h-7 w-12 bg-white/10 rounded animate-pulse" />
                            ) : (
                                <p className="text-xl sm:text-2xl font-bold text-white">{stats?.premiumCompanies || 0}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <QuickAction
                            icon={Users}
                            label="View All Applicants"
                            onClick={() => window.location.href = '/admin/applicants'}
                        />
                        <QuickAction
                            icon={Building2}
                            label="View All Companies"
                            onClick={() => window.location.href = '/admin/companies'}
                            color="pink"
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white">Recent Activity</h3>
                    <span className="text-dark-400 text-xs sm:text-sm">Latest registrations</span>
                </div>
                <div className="space-y-2 sm:space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                            <ActivityItem key={index} {...activity} />
                        ))
                    ) : (
                        <p className="text-dark-400 text-center py-8">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
}
