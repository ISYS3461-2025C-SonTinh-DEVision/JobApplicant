/**
 * Privacy Settings Component
 * 
 * Profile visibility and data control options.
 * Includes Cookie Consent status and account deletion with modal confirmation.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Uses HeadlessModal
 */

import React, { useState, useEffect } from 'react';
import { Eye, Globe, Users, Lock, Trash2, AlertTriangle, Download, Shield, Cookie, Check, Mail, Info } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useHeadlessModal } from '../../../../components/headless';
import { getCookieConsentDetails } from '../../../../components/common/CookieConsentBanner';

export default function PrivacySettings() {
    const { isDark } = useTheme();
    const deleteModal = useHeadlessModal();

    // Privacy settings state
    const [visibility, setVisibility] = useState('public');
    const [showEmail, setShowEmail] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [dataSharingEnabled, setDataSharingEnabled] = useState(true);
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

    return (
        <div className="space-y-8">
            {/* Cookie Consent Status */}
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

            {/* Profile Visibility */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Eye className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                    <h3 className={`font-semibold ${textPrimary}`}>Profile Visibility</h3>
                </div>
                <div className="space-y-3">
                    {visibilityOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = visibility === option.id;
                        return (
                            <button
                                key={option.id}
                                onClick={() => setVisibility(option.id)}
                                className={`
                                    w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                                    ${isSelected
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : `${borderColor} ${cardBg} hover:border-primary-500/30`
                                    }
                                `}
                            >
                                <div className={`p-3 rounded-xl ${isSelected ? 'bg-primary-500/20' : isDark ? 'bg-dark-600' : 'bg-gray-200'}`}>
                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-400' : isDark ? 'text-dark-300' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={`font-medium ${textPrimary}`}>{option.label}</p>
                                    <p className={`text-sm ${textSecondary}`}>{option.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary-500 bg-primary-500' : borderColor}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contact Info Visibility */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Shield className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                    <h3 className={`font-semibold ${textPrimary}`}>Contact Information</h3>
                </div>
                <div className={`rounded-xl border ${borderColor} divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                    <ToggleItem
                        label="Show Email"
                        description="Display email on your public profile"
                        enabled={showEmail}
                        onChange={setShowEmail}
                        isDark={isDark}
                    />
                    <ToggleItem
                        label="Show Phone Number"
                        description="Display phone number on your profile"
                        enabled={showPhone}
                        onChange={setShowPhone}
                        isDark={isDark}
                    />
                    <ToggleItem
                        label="Allow Data Sharing"
                        description="Share anonymized data to improve recommendations"
                        enabled={dataSharingEnabled}
                        onChange={setDataSharingEnabled}
                        isDark={isDark}
                    />
                </div>
            </div>

            {/* Data Export */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Download className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                    <h3 className={`font-semibold ${textPrimary}`}>Your Data</h3>
                </div>
                <div className={`p-4 rounded-xl border ${borderColor} ${cardBg}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`font-medium ${textPrimary}`}>Download Your Data</p>
                            <p className={`text-sm ${textSecondary}`}>Get a copy of all your DEVision data</p>
                        </div>
                        <button className={`px-4 py-2 rounded-xl border ${borderColor} font-medium text-sm transition-colors ${isDark ? 'text-dark-300 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                            Request Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className={`font-semibold text-red-500`}>Danger Zone</h3>
                </div>
                <div className={`p-4 rounded-xl border-2 border-red-500/30 ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`font-medium ${textPrimary}`}>Delete Account</p>
                            <p className={`text-sm ${textSecondary}`}>Permanently delete your account and all data</p>
                        </div>
                        <button
                            onClick={deleteModal.open}
                            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-md p-6 rounded-2xl ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white'} shadow-2xl`}>
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className={`text-xl font-bold ${textPrimary}`}>Delete Account?</h3>
                            <p className={`mt-2 ${textSecondary}`}>
                                This action cannot be undone. All your data, applications, and profile will be permanently deleted.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={deleteModal.close}
                                className={`flex-1 px-4 py-3 rounded-xl border ${borderColor} font-medium transition-colors ${isDark ? 'text-dark-300 hover:bg-dark-700' : 'hover:bg-gray-50'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteModal.close}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                                Yes, Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple Toggle Item Component
const ToggleItem = ({ label, description, enabled, onChange, isDark }) => (
    <div className="flex items-center justify-between p-4">
        <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{description}</p>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary-500' : isDark ? 'bg-dark-600' : 'bg-gray-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

