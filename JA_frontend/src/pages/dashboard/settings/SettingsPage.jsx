/**
 * Settings Page
 * 
 * Comprehensive settings page with multiple sections:
 * - General: Account preferences, language
 * - Notifications: Email/push notification preferences
 * - Appearance: Theme, display settings
 * - Privacy: Profile visibility, data controls
 * - Legal: Terms of Service, Privacy Policy, etc.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * Uses Headless Tabs for section navigation
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Settings, Bell, Palette, Shield, FileText,
    ChevronRight, User
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { Tabs, TabList, Tab, TabPanel } from '../../../components/headless';

// Setting Components
import GeneralSettings from './components/GeneralSettings';
import NotificationSettings from './components/NotificationSettings';
import AppearanceSettings from './components/AppearanceSettings';
import PrivacySettings from './components/PrivacySettings';
import LegalSettings from './components/LegalSettings';

// Tab configuration
const SETTINGS_TABS = [
    { id: 'general', label: 'General', icon: User, description: 'Account preferences' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Manage alerts' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme & display' },
    { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Data & visibility' },
    { id: 'legal', label: 'Legal', icon: FileText, description: 'Terms & policies' },
];

export default function SettingsPage() {
    const { isDark } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');

    // Update URL when tab changes
    useEffect(() => {
        if (activeTab !== 'general') {
            setSearchParams({ tab: activeTab });
        } else {
            setSearchParams({});
        }
    }, [activeTab, setSearchParams]);

    // Handle tab change
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    // Styles
    const cardClass = isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                        <Settings className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
                            Settings
                        </h1>
                        <p className={`mt-1 ${textSecondary}`}>
                            Manage your account preferences and privacy
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className={`rounded-2xl border ${cardClass} overflow-hidden`}>
                        <div className={`px-4 py-3 border-b ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                            <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
                                Settings
                            </p>
                        </div>
                        <div className="p-2">
                            {SETTINGS_TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-3 rounded-xl
                                            transition-all duration-200 group
                                            ${isActive
                                                ? `${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-600'}`
                                                : `${isDark ? 'text-dark-300 hover:bg-dark-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                            }
                                        `}
                                    >
                                        <div className={`
                                            p-2 rounded-lg transition-colors
                                            ${isActive
                                                ? `${isDark ? 'bg-primary-500/30' : 'bg-primary-100'}`
                                                : `${isDark ? 'bg-dark-700 group-hover:bg-dark-600' : 'bg-gray-100 group-hover:bg-gray-200'}`
                                            }
                                        `}>
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : ''}`} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-sm">{tab.label}</p>
                                            <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                                                {tab.description}
                                            </p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''} ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <div className={`rounded-2xl border ${cardClass} overflow-hidden`}>
                        {/* Tab Header */}
                        <div className={`px-6 py-4 border-b ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                            {SETTINGS_TABS.map((tab) => {
                                if (activeTab !== tab.id) return null;
                                const Icon = tab.icon;
                                return (
                                    <div key={tab.id} className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                                        <div>
                                            <h2 className={`font-semibold ${textPrimary}`}>{tab.label}</h2>
                                            <p className={`text-sm ${textSecondary}`}>{tab.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'general' && <GeneralSettings />}
                            {activeTab === 'notifications' && <NotificationSettings />}
                            {activeTab === 'appearance' && <AppearanceSettings />}
                            {activeTab === 'privacy' && <PrivacySettings />}
                            {activeTab === 'legal' && <LegalSettings />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
