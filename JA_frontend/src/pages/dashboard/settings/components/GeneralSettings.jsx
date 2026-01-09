/**
 * General Settings Component
 * 
 * Account preferences and quick access to other settings.
 * Includes language preference (placeholder) and security links.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Shield, User, ChevronRight, Info, Mail, Key } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../hooks/useAuth';

export default function GeneralSettings() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { currentUser } = useAuth();

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-dark-700/50' : 'bg-gray-50';
    const borderColor = isDark ? 'border-dark-600' : 'border-gray-200';

    const settingsLinks = [
        {
            icon: Mail,
            label: 'Email & Password',
            description: 'Update your email address and password',
            path: '/dashboard/security',
            badge: null,
        },
        {
            icon: User,
            label: 'Edit Profile',
            description: 'Update your profile information',
            path: '/dashboard/profile/edit',
            badge: null,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Account Info */}
            <div className={`p-4 rounded-xl ${cardBg} border ${borderColor}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                        <User className="w-6 h-6 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${textPrimary}`}>Account Information</h3>
                        <p className={`text-sm ${textSecondary} mt-1`}>
                            {currentUser?.email || 'Not logged in'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentUser?.isPremium
                                    ? 'bg-yellow-500/20 text-yellow-500'
                                    : isDark ? 'bg-dark-600 text-dark-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {currentUser?.isPremium ? 'Premium' : 'Free Plan'}
                            </span>
                            {currentUser?.authProvider === 'google' && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    Google Account
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Language Preference (Placeholder) */}
            <div>
                <h4 className={`text-sm font-medium mb-3 ${textPrimary}`}>Language & Region</h4>
                <div className={`p-4 rounded-xl ${cardBg} border ${borderColor}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                            <div>
                                <p className={`font-medium ${textPrimary}`}>English (US)</p>
                                <p className={`text-sm ${textSecondary}`}>Display language</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-dark-600 text-dark-300' : 'bg-gray-200 text-gray-500'}`}>
                            Coming Soon
                        </span>
                    </div>
                </div>
                <p className={`mt-2 text-xs flex items-center gap-1.5 ${textSecondary}`}>
                    <Info className="w-3.5 h-3.5" />
                    More languages will be available in future updates
                </p>
            </div>

            {/* Quick Links */}
            <div>
                <h4 className={`text-sm font-medium mb-3 ${textPrimary}`}>Quick Access</h4>
                <div className="space-y-2">
                    {settingsLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                className={`
                                    w-full flex items-center gap-3 p-4 rounded-xl
                                    border ${borderColor} ${cardBg}
                                    transition-all duration-200 group
                                    hover:border-primary-500/50
                                    ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}
                                `}
                            >
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-600' : 'bg-gray-200'} group-hover:bg-primary-500/20 transition-colors`}>
                                    <Icon className={`w-4 h-4 ${isDark ? 'text-dark-300' : 'text-gray-500'} group-hover:text-primary-400`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={`font-medium ${textPrimary}`}>{link.label}</p>
                                    <p className={`text-sm ${textSecondary}`}>{link.description}</p>
                                </div>
                                {link.badge && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400">
                                        {link.badge}
                                    </span>
                                )}
                                <ChevronRight className={`w-4 h-4 ${isDark ? 'text-dark-500' : 'text-gray-400'} group-hover:text-primary-400 transition-transform group-hover:translate-x-1`} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
