/**
 * Notification Settings Component
 * 
 * Manage email and push notification preferences.
 * Uses headless toggle components for switches.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

import React, { useState, useCallback } from 'react';
import { Mail, Bell, Briefcase, FileText, Crown, Megaphone, Info, Check } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import useHeadlessToggle from '../../../../components/headless/HeadlessToggle';

// Toggle Switch Component using headless hook
const ToggleSwitch = ({ enabled, onChange, label, description, icon: Icon, isDark }) => {
    const toggleState = useHeadlessToggle({
        defaultEnabled: enabled,
        onChange: onChange,
    });

    return (
        <div className={`flex items-start justify-between p-4 rounded-xl transition-colors ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'
            }`}>
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className={`p-2 rounded-lg mt-0.5 ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                        <Icon className={`w-4 h-4 ${isDark ? 'text-dark-300' : 'text-gray-500'}`} />
                    </div>
                )}
                <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{description}</p>
                </div>
            </div>
            <button
                onClick={toggleState.toggle}
                className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${isDark ? 'focus:ring-offset-dark-800' : 'focus:ring-offset-white'}
                    ${toggleState.enabled
                        ? 'bg-primary-500'
                        : isDark ? 'bg-dark-600' : 'bg-gray-300'
                    }
                `}
                role="switch"
                aria-checked={toggleState.enabled}
            >
                <span
                    className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                        shadow-sm
                        ${toggleState.enabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
        </div>
    );
};

export default function NotificationSettings() {
    const { isDark } = useTheme();

    // Notification preferences state
    const [preferences, setPreferences] = useState({
        emailJobAlerts: true,
        emailApplicationUpdates: true,
        emailWeeklyDigest: false,
        emailPromotions: false,
        pushJobMatches: true,
        pushMessages: true,
        pushReminders: false,
    });

    const [saved, setSaved] = useState(false);

    const handleToggle = useCallback((key) => (enabled) => {
        setPreferences(prev => ({ ...prev, [key]: enabled }));
        setSaved(false);
    }, []);

    const handleSave = () => {
        // In real app, save to backend
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-dark-700' : 'border-gray-200';
    const cardBg = isDark ? 'bg-dark-700/30' : 'bg-gray-50';

    return (
        <div className="space-y-6">
            {/* Email Notifications */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Mail className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                    <h3 className={`font-semibold ${textPrimary}`}>Email Notifications</h3>
                </div>
                <div className={`rounded-xl border ${borderColor} divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                    <ToggleSwitch
                        enabled={preferences.emailJobAlerts}
                        onChange={handleToggle('emailJobAlerts')}
                        label="Job Alerts"
                        description="Get notified when new jobs match your preferences"
                        icon={Briefcase}
                        isDark={isDark}
                    />
                    <ToggleSwitch
                        enabled={preferences.emailApplicationUpdates}
                        onChange={handleToggle('emailApplicationUpdates')}
                        label="Application Updates"
                        description="Receive updates about your job applications"
                        icon={FileText}
                        isDark={isDark}
                    />
                    <ToggleSwitch
                        enabled={preferences.emailWeeklyDigest}
                        onChange={handleToggle('emailWeeklyDigest')}
                        label="Weekly Digest"
                        description="A weekly summary of new opportunities"
                        icon={Crown}
                        isDark={isDark}
                    />
                    <ToggleSwitch
                        enabled={preferences.emailPromotions}
                        onChange={handleToggle('emailPromotions')}
                        label="Promotions & Updates"
                        description="News about DEVision features and offers"
                        icon={Megaphone}
                        isDark={isDark}
                    />
                </div>
            </div>

            {/* Push Notifications */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Bell className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                    <h3 className={`font-semibold ${textPrimary}`}>Push Notifications</h3>
                </div>
                <div className={`rounded-xl border ${borderColor} divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                    <ToggleSwitch
                        enabled={preferences.pushJobMatches}
                        onChange={handleToggle('pushJobMatches')}
                        label="Job Matches"
                        description="Instant alerts for matching job posts (Premium)"
                        icon={Briefcase}
                        isDark={isDark}
                    />
                    <ToggleSwitch
                        enabled={preferences.pushMessages}
                        onChange={handleToggle('pushMessages')}
                        label="Messages"
                        description="Notifications for new messages from employers"
                        icon={Mail}
                        isDark={isDark}
                    />
                    <ToggleSwitch
                        enabled={preferences.pushReminders}
                        onChange={handleToggle('pushReminders')}
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
                        Premium users receive real-time notifications for job matches via WebSocket.
                        <span className={`font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'}`}> Upgrade now</span> to never miss an opportunity.
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4">
                {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-green-500">
                        <Check className="w-4 h-4" />
                        Preferences saved
                    </span>
                )}
                <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/25"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
}
