/**
 * Notification Settings Component
 * 
 * Manage email and push notification preferences.
 * Uses headless toggle components for switches.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * NOTE: All notification settings are Coming Soon - functionality not yet implemented.
 */

import React from 'react';
import { Mail, Bell, Briefcase, FileText, Crown, Megaphone, Info, Clock } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

// Coming Soon Toggle Component - Disabled
const ComingSoonToggle = ({ label, description, icon: Icon, isDark }) => {
    return (
        <div className={`flex items-start justify-between p-4 rounded-xl transition-colors opacity-60 cursor-not-allowed ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className={`p-2 rounded-lg mt-0.5 ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                        <Icon className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2">
                        <p className={`font-medium ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>{label}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                            Coming Soon
                        </span>
                    </div>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>{description}</p>
                </div>
            </div>
            {/* Disabled Toggle */}
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-not-allowed ${isDark ? 'bg-dark-600/50' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white/50 shadow-sm translate-x-1`} />
            </div>
        </div>
    );
};

export default function NotificationSettings() {
    const { isDark } = useTheme();

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-dark-700' : 'border-gray-200';
    const cardBg = isDark ? 'bg-dark-700/30' : 'bg-gray-50';

    return (
        <div className="space-y-6">
            {/* Coming Soon Banner */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'} flex items-center gap-3`}>
                <Clock className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div>
                    <p className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Notification Settings Coming Soon
                    </p>
                    <p className={`text-sm ${isDark ? 'text-yellow-400/70' : 'text-yellow-600'}`}>
                        We're working on bringing you customizable notification preferences. Stay tuned!
                    </p>
                </div>
            </div>

            {/* Email Notifications - Disabled */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Mail className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>Email Notifications</h3>
                </div>
                <div className={`rounded-xl border ${borderColor} divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                    <ComingSoonToggle
                        label="Job Alerts"
                        description="Get notified when new jobs match your preferences"
                        icon={Briefcase}
                        isDark={isDark}
                    />
                    <ComingSoonToggle
                        label="Application Updates"
                        description="Receive updates about your job applications"
                        icon={FileText}
                        isDark={isDark}
                    />
                    <ComingSoonToggle
                        label="Weekly Digest"
                        description="A weekly summary of new opportunities"
                        icon={Crown}
                        isDark={isDark}
                    />
                    <ComingSoonToggle
                        label="Promotions & Updates"
                        description="News about DEVision features and offers"
                        icon={Megaphone}
                        isDark={isDark}
                    />
                </div>
            </div>

            {/* Push Notifications - Disabled */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Bell className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>Push Notifications</h3>
                </div>
                <div className={`rounded-xl border ${borderColor} divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                    <ComingSoonToggle
                        label="Job Matches"
                        description="Instant alerts for matching job posts (Premium)"
                        icon={Briefcase}
                        isDark={isDark}
                    />
                    <ComingSoonToggle
                        label="Messages"
                        description="Notifications for new messages from employers"
                        icon={Mail}
                        isDark={isDark}
                    />
                    <ComingSoonToggle
                        label="Reminders"
                        description="Application deadlines and follow-up reminders"
                        icon={Bell}
                        isDark={isDark}
                    />
                </div>
            </div>

            {/* Info Box */}
            <div className={`p-4 rounded-xl ${cardBg} border ${borderColor} flex items-start gap-3`}>
                <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <div>
                    <p className={`text-sm ${textSecondary}`}>
                        Premium users will receive real-time notifications for job matches via WebSocket.
                        <span className={`font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'}`}> Upgrade now</span> to never miss an opportunity.
                    </p>
                </div>
            </div>
        </div>
    );
}
