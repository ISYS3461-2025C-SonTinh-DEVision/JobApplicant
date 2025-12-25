/**
 * Admin Dashboard Page
 * Overview with statistics and recent activity
 * 
 * Uses: useHeadlessDataList for statistics display
 */

import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    Briefcase,
    Activity,
    TrendingUp,
    Crown,
    Clock,
    UserPlus,
    FileText,
    ArrowUpRight,
} from 'lucide-react';
import { useHeadlessDataList } from '../../components/headless';
import AdminService from '../../services/AdminService';

// Stat Card Component
function StatCard({ icon: Icon, title, value, trend, color = 'violet' }) {
    const colorClasses = {
        violet: 'from-violet-500 to-violet-600',
        pink: 'from-pink-500 to-pink-600',
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
    };

    return (
        <div className="glass-card p-6 hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <h3 className="text-dark-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
    );
}

// Activity Item Component
function ActivityItem({ type, action, name, time }) {
    const icons = {
        applicant: UserPlus,
        job: FileText,
        company: Building2,
    };

    const colors = {
        applicant: 'text-blue-400 bg-blue-500/20',
        job: 'text-emerald-400 bg-emerald-500/20',
        company: 'text-violet-400 bg-violet-500/20',
    };

    const Icon = icons[type] || Activity;

    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[type]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{name}</p>
                <p className="text-dark-400 text-sm capitalize">{action}</p>
            </div>
            <div className="flex items-center gap-2 text-dark-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>{time}</span>
            </div>
        </div>
    );
}

// Quick Action Button
function QuickAction({ icon: Icon, label, onClick, color = 'violet' }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-${color}-500/30 transition-all group`}
        >
            <Icon className={`w-5 h-5 text-${color}-400`} />
            <span className="text-white font-medium">{label}</span>
            <ArrowUpRight className="w-4 h-4 ml-auto text-dark-500 group-hover:text-white transition-colors" />
        </button>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use headless data list for recent activity
    const {
        items: recentActivity,
        isLoading: activityLoading,
    } = useHeadlessDataList({
        initialData: stats?.recentActivity || [],
        idField: 'name',
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await AdminService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 bg-white/10 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-dark-400">Welcome to the DEVision Admin Panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="Total Applicants"
                    value={stats?.totalApplicants || 0}
                    trend="+12%"
                    color="violet"
                />
                <StatCard
                    icon={Building2}
                    title="Total Companies"
                    value={stats?.totalCompanies || 0}
                    trend="+5%"
                    color="pink"
                />
                <StatCard
                    icon={Briefcase}
                    title="Active Job Posts"
                    value={stats?.totalJobPosts || 0}
                    trend="+8%"
                    color="blue"
                />
                <StatCard
                    icon={Activity}
                    title="Active Users"
                    value={stats?.activeUsers || 0}
                    trend="+15%"
                    color="emerald"
                />
            </div>

            {/* Premium Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-white">Premium Subscriptions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5">
                            <p className="text-dark-400 text-sm mb-1">Premium Applicants</p>
                            <p className="text-2xl font-bold text-white">{stats?.premiumApplicants || 0}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5">
                            <p className="text-dark-400 text-sm mb-1">Premium Companies</p>
                            <p className="text-2xl font-bold text-white">{stats?.premiumCompanies || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
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
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <span className="text-dark-400 text-sm">Last 24 hours</span>
                </div>
                <div className="space-y-3">
                    {(stats?.recentActivity || []).map((activity, index) => (
                        <ActivityItem key={index} {...activity} />
                    ))}
                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                        <p className="text-dark-400 text-center py-8">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
}
