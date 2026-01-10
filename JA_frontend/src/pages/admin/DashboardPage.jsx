/**
 * Admin Dashboard Page
 * Overview with statistics and recent activity
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * Uses: Card, useHeadlessDataList, useHeadlessSearch, Tabs
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Search,
    X,
    Loader2,
    TrendingUp,
    Eye,
    AlertTriangle,
} from 'lucide-react';
import AdminService from '../../services/AdminService';

// Headless UI Imports (Ultimo A.3.a)
import { Card, useCard } from '../../components/headless/card';
import useHeadlessDataList from '../../components/headless/HeadlessDataList';
import useHeadlessSearch from '../../components/headless/HeadlessSearch';


// Stat Card Component - Using Headless Card Pattern (Ultimo A.3.a)
function StatCard({ icon: Icon, title, value, subtitle, trend, color = 'violet', loading = false, onClick }) {
    const colorClasses = {
        violet: 'from-violet-500 to-violet-600',
        pink: 'from-pink-500 to-pink-600',
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
    };

    const trendColors = {
        up: 'text-emerald-400',
        down: 'text-red-400',
        neutral: 'text-dark-400',
    };

    // Using headless card hook for interaction logic
    const { getCardProps, isHovered } = useCard({
        item: { title, value },
        onView: onClick,
    });

    return (
        <Card
            item={{ title, value }}
            onView={onClick}
            className={`glass-card p-4 sm:p-6 hover:border-white/20 transition-all duration-300 group cursor-pointer ${isHovered ? 'scale-[1.02] shadow-xl' : ''}`}
        >
            {({ isHovered }) => (
                <>
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg transition-transform ${isHovered ? 'scale-110' : 'group-hover:scale-110'}`}>
                            <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                        {trend && (
                            <div className={`flex items-center gap-1 text-xs ${trendColors[trend.direction || 'neutral']}`}>
                                {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                                {trend.value && <span>{trend.value}</span>}
                            </div>
                        )}
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
                </>
            )}
        </Card>
    );
}


// Activity Item Component - Using Headless Card Pattern (Ultimo A.3.a)
function ActivityItem({ type, action, name, time, status, onView }) {
    const icons = {
        applicant_registered: UserPlus,
        applicant_deactivated: UserMinus,
        job_posted: FileText,
        company_registered: Building2,
        status_changed: CheckCircle,
        profile_viewed: Eye,
        warning: AlertTriangle,
    };

    const colors = {
        applicant_registered: 'text-blue-400 bg-blue-500/20',
        applicant_deactivated: 'text-red-400 bg-red-500/20',
        job_posted: 'text-emerald-400 bg-emerald-500/20',
        company_registered: 'text-violet-400 bg-violet-500/20',
        status_changed: 'text-yellow-400 bg-yellow-500/20',
        profile_viewed: 'text-cyan-400 bg-cyan-500/20',
        warning: 'text-orange-400 bg-orange-500/20',
    };

    const Icon = icons[type] || Activity;

    return (
        <Card
            item={{ name, type, action, time }}
            onView={onView}
            className="activity-item-card"
        >
            {({ isHovered }) => (
                <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 transition-all duration-200 ${isHovered ? 'bg-white/10 scale-[1.01]' : 'hover:bg-white/10'}`}>
                    <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-transform ${colors[type] || 'text-gray-400 bg-gray-500/20'} ${isHovered ? 'scale-110' : ''}`}>
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
            )}
        </Card>
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
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);

    // Global Search State (Req 6.2.1)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ applicants: [], companies: [], jobPosts: [] });
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    // Global Search Handler (Req 6.2.1)
    const handleSearch = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSearchResults({ applicants: [], companies: [], jobPosts: [] });
            setShowResults(false);
            return;
        }

        setSearching(true);
        setShowResults(true);
        try {
            // Search all entities in parallel
            const [applicantsRes, companiesRes, jobPostsRes] = await Promise.all([
                AdminService.getApplicants({ search: query, page: 1, limit: 5 }),
                AdminService.getCompanies({ search: query, page: 1, limit: 5 }),
                AdminService.getJobPosts({ search: query, page: 1, limit: 5 }),
            ]);

            setSearchResults({
                applicants: applicantsRes.data || [],
                companies: companiesRes.data || [],
                jobPosts: jobPostsRes.data || [],
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    }, []);

    // Debounced search
    const onSearchChange = useCallback((e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            handleSearch(query);
        }, 300);
    }, [handleSearch]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            {/* Header with Global Search (Req 6.2.1) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Dashboard Overview</h1>
                    <p className="text-dark-400 text-sm sm:text-base">Welcome to the DEVision Admin Panel</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Global Search Bar (Req 6.2.1) */}
                    <div className="relative" ref={searchRef}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                                type="text"
                                placeholder="Search applicants, companies, jobs..."
                                value={searchQuery}
                                onChange={onSearchChange}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                className="w-64 pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-dark-400 focus:border-violet-500 outline-none transition-colors text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setShowResults(false); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                                {searching ? (
                                    <div className="p-4 flex items-center justify-center gap-2 text-dark-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Searching...</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Applicants */}
                                        {searchResults.applicants.length > 0 && (
                                            <div className="p-2">
                                                <p className="px-2 py-1 text-xs text-dark-500 uppercase tracking-wide">Applicants</p>
                                                {searchResults.applicants.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => { navigate('/admin/applicants'); setShowResults(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-left"
                                                    >
                                                        <Users className="w-4 h-4 text-violet-400" />
                                                        <span className="text-white text-sm">{item.name}</span>
                                                        <span className="text-dark-500 text-xs ml-auto">{item.email}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Companies */}
                                        {searchResults.companies.length > 0 && (
                                            <div className="p-2 border-t border-white/5">
                                                <p className="px-2 py-1 text-xs text-dark-500 uppercase tracking-wide">Companies</p>
                                                {searchResults.companies.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => { navigate('/admin/companies'); setShowResults(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-left"
                                                    >
                                                        <Building2 className="w-4 h-4 text-pink-400" />
                                                        <span className="text-white text-sm">{item.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Job Posts */}
                                        {searchResults.jobPosts.length > 0 && (
                                            <div className="p-2 border-t border-white/5">
                                                <p className="px-2 py-1 text-xs text-dark-500 uppercase tracking-wide">Job Posts</p>
                                                {searchResults.jobPosts.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => { navigate('/admin/job-posts'); setShowResults(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-left"
                                                    >
                                                        <Briefcase className="w-4 h-4 text-blue-400" />
                                                        <span className="text-white text-sm">{item.title}</span>
                                                        <span className="text-dark-500 text-xs ml-auto">{item.company}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* No results */}
                                        {searchResults.applicants.length === 0 &&
                                            searchResults.companies.length === 0 &&
                                            searchResults.jobPosts.length === 0 && (
                                                <div className="p-4 text-center text-dark-400 text-sm">
                                                    No results found for "{searchQuery}"
                                                </div>
                                            )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
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
                            onClick={() => navigate('/admin/applicants')}
                        />
                        <QuickAction
                            icon={Building2}
                            label="View All Companies"
                            onClick={() => navigate('/admin/companies')}
                            color="pink"
                        />
                        <QuickAction
                            icon={Briefcase}
                            label="View All Job Posts"
                            onClick={() => navigate('/admin/job-posts')}
                            color="blue"
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
