/**
 * Privacy Settings Component
 * 
 * Profile visibility and data control options.
 * Includes Cookie Consent status and account deletion with modal confirmation.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Uses HeadlessModal
 * 
 * NOTE: Profile Visibility, Contact Information, Data Export, and Delete Account are Coming Soon.
 */

import React, { useState, useEffect } from 'react';
import { Eye, Globe, Users, Lock, Trash2, AlertTriangle, Download, Shield, Cookie, Check, Mail, Info, Clock } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { getCookieConsentDetails } from '../../../../components/common/CookieConsentBanner';

export default function PrivacySettings() {
    const { isDark } = useTheme();

    // Cookie consent state
    const [cookieConsentDate, setCookieConsentDate] = useState(null);

    // Load cookie consent details
    useEffect(() => {
        const consent = getCookieConsentDetails();
        if (consent?.timestamp) {
            setCookieConsentDate(new Date(consent.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));
        }
    }, []);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-dark-700' : 'border-gray-200';
    const cardBg = isDark ? 'bg-dark-700/50' : 'bg-gray-50';

    const visibilityOptions = [
        { id: 'public', label: 'Public', icon: Globe, description: 'Visible to all employers' },
        { id: 'connections', label: 'Connections Only', icon: Users, description: 'Only visible to connected companies' },
        { id: 'private', label: 'Private', icon: Lock, description: 'Hidden from employer searches' },
    ];

    // Coming Soon Badge Component
    const ComingSoonBadge = () => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
            Coming Soon
        </span>
    );

    return (
        <div className="space-y-8">
            {/* Cookie Consent Status - WORKING */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Cookie className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                    <h3 className={`font-semibold ${textPrimary}`}>Cookie Consent</h3>
                </div>
                <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
                    {/* Cookie Status - Always ON */}
                    <div className={`p-4 ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                                    <Check className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className={`font-medium ${textPrimary}`}>Cookie Usage Accepted</p>
                                    <p className={`text-sm ${textSecondary}`}>
                                        {cookieConsentDate
                                            ? `Accepted on ${cookieConsentDate}`
                                            : 'Required for platform functionality'}
                                    </p>
                                </div>
                            </div>
                            {/* Locked Toggle - Always ON */}
                            <div className="flex items-center gap-2">
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 cursor-not-allowed opacity-80">
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm translate-x-6" />
                                </div>
                                <Lock className={`w-4 h-4 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className={`p-4 border-t ${borderColor} ${cardBg}`}>
                        <div className="flex items-start gap-3">
                            <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                            <div className="flex-1">
                                <p className={`text-sm ${textSecondary}`}>
                                    Cookie consent is <strong className={textPrimary}>required</strong> to use DEVision.
                                    Cookies are essential for authentication, security, and saving your preferences.
                                </p>
                                <div className={`mt-3 flex items-center gap-2 text-sm ${textSecondary}`}>
                                    <Mail className="w-4 h-4" />
                                    <span>Questions? Contact </span>
                                    <a
                                        href="mailto:admin@devision.com"
                                        className={`font-medium ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}
                                    >
                                        admin@devision.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Visibility - COMING SOON */}
            <div className="opacity-60">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>Profile Visibility</h3>
                    <ComingSoonBadge />
                </div>
                <div className="space-y-3">
                    {visibilityOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <div
                                key={option.id}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 cursor-not-allowed
                                    ${borderColor} ${cardBg}
                                `}
                            >
                                <div className={`p-3 rounded-xl ${isDark ? 'bg-dark-600' : 'bg-gray-200'}`}>
                                    <Icon className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={`font-medium ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>{option.label}</p>
                                    <p className={`text-sm ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>{option.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${borderColor}`} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contact Info Visibility - COMING SOON */}
            <div className="opacity-60">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>Contact Information</h3>
                    <ComingSoonBadge />
                </div>
                <div className={`rounded-xl border ${borderColor} divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                    <DisabledToggleItem
                        label="Show Email"
                        description="Display email on your public profile"
                        isDark={isDark}
                    />
                    <DisabledToggleItem
                        label="Show Phone Number"
                        description="Display phone number on your profile"
                        isDark={isDark}
                    />
                </div>
            </div>

            {/* Data Export - COMING SOON */}
            <div className="opacity-60">
                <div className="flex items-center gap-2 mb-4">
                    <Download className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>Your Data</h3>
                    <ComingSoonBadge />
                </div>
                <div className={`p-4 rounded-xl border ${borderColor} ${cardBg}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`font-medium ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>Download Your Data</p>
                            <p className={`text-sm ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>Get a copy of all your DEVision data</p>
                        </div>
                        <button
                            disabled
                            className={`px-4 py-2 rounded-xl border ${borderColor} font-medium text-sm cursor-not-allowed opacity-50
                                ${isDark ? 'text-dark-400 bg-dark-600' : 'text-gray-400 bg-gray-100'}`}
                        >
                            Request Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone - COMING SOON */}
            <div className="opacity-60">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>Danger Zone</h3>
                    <ComingSoonBadge />
                </div>
                <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-dark-600 bg-dark-700/30' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`font-medium ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>Delete Account</p>
                            <p className={`text-sm ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>Permanently delete your account and all data</p>
                        </div>
                        <button
                            disabled
                            className={`px-4 py-2 rounded-xl font-medium text-sm cursor-not-allowed opacity-50 flex items-center gap-2
                                ${isDark ? 'bg-dark-600 text-dark-400' : 'bg-gray-200 text-gray-400'}`}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Disabled Toggle Item Component
const DisabledToggleItem = ({ label, description, isDark }) => (
    <div className="flex items-center justify-between p-4 cursor-not-allowed">
        <div>
            <p className={`font-medium ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>{label}</p>
            <p className={`text-sm ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>{description}</p>
        </div>
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${isDark ? 'bg-dark-600/50' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white/50 shadow-sm translate-x-1`} />
        </div>
    </div>
);
