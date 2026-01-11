/**
 * Legal Settings Component
 * 
 * Hub for all legal documents with expandable sections.
 * Uses accordion pattern with scrollable content and full-screen modal.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

import React, { useState } from 'react';
import { FileText, ChevronDown, Scale, Shield, Cookie, AlertCircle, CreditCard, HelpCircle, Maximize2, X, ArrowUp } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

// Legal document components
import TermsOfService from '../legal/TermsOfService';
import PrivacyPolicy from '../legal/PrivacyPolicy';
import CookiePolicy from '../legal/CookiePolicy';
import Disclaimer from '../legal/Disclaimer';
import RefundPolicy from '../legal/RefundPolicy';
import FAQ from '../legal/FAQ';

const LEGAL_SECTIONS = [
    { id: 'terms', label: 'Terms of Service', icon: Scale, Component: TermsOfService, color: 'blue' },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, Component: PrivacyPolicy, color: 'green' },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie, Component: CookiePolicy, color: 'orange' },
    { id: 'disclaimer', label: 'Disclaimer', icon: AlertCircle, Component: Disclaimer, color: 'red' },
    { id: 'refund', label: 'Refund Policy', icon: CreditCard, Component: RefundPolicy, color: 'purple' },
    { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle, Component: FAQ, color: 'yellow' },
];

const getColorClasses = (color, isDark) => {
    const colors = {
        blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
        green: isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600',
        orange: isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600',
        red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600',
        purple: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600',
        yellow: isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
    };
    return colors[color] || colors.blue;
};

export default function LegalSettings({ initialSection = null }) {
    const { isDark } = useTheme();
    const [expandedSection, setExpandedSection] = useState(initialSection);
    const [fullScreenDoc, setFullScreenDoc] = useState(null);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-dark-700' : 'border-gray-200';
    const cardBg = isDark ? 'bg-dark-700/30' : 'bg-gray-50';

    const toggleSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    const openFullScreen = (section) => {
        setFullScreenDoc(section);
        document.body.style.overflow = 'hidden';
    };

    const closeFullScreen = () => {
        setFullScreenDoc(null);
        document.body.style.overflow = '';
    };

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className={`p-4 rounded-xl ${cardBg} border ${borderColor} flex items-start gap-3`}>
                <FileText className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                <div>
                    <p className={`font-medium ${textPrimary}`}>Legal Information</p>
                    <p className={`text-sm mt-1 ${textSecondary}`}>
                        Review our terms, policies, and legal documents. Click to expand or use fullscreen for easier reading.
                    </p>
                </div>
            </div>

            {/* Accordion Sections */}
            <div className={`rounded-2xl border ${borderColor} overflow-hidden divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                {LEGAL_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSection === section.id;
                    const Component = section.Component;

                    return (
                        <div key={section.id}>
                            {/* Accordion Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className={`
                                    w-full flex items-center gap-4 p-4 transition-colors
                                    ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'}
                                    ${isExpanded ? (isDark ? 'bg-dark-700/30' : 'bg-gray-50') : ''}
                                `}
                            >
                                <div className={`p-2.5 rounded-xl ${getColorClasses(section.color, isDark)}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={`font-medium ${textPrimary}`}>{section.label}</p>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 transition-transform duration-300 ${isDark ? 'text-dark-400' : 'text-gray-400'} ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Accordion Content - Scrollable */}
                            {isExpanded && (
                                <div className={`border-t ${isDark ? 'border-dark-700 bg-dark-800/50' : 'border-gray-100 bg-white'}`}>
                                    {/* Toolbar */}
                                    <div className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? 'border-dark-700 bg-dark-700/30' : 'border-gray-100 bg-gray-50'}`}>
                                        <span className={`text-xs font-medium ${textSecondary}`}>
                                            Scroll to read • Click fullscreen for easier reading
                                        </span>
                                        <button
                                            onClick={() => openFullScreen(section)}
                                            className={`
                                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                                                transition-colors
                                                ${isDark
                                                    ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                                                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                                }
                                            `}
                                        >
                                            <Maximize2 className="w-3.5 h-3.5" />
                                            Fullscreen
                                        </button>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="max-h-[400px] overflow-y-auto p-6 scrollbar-thin">
                                        <Component />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Last Updated */}
            <div className={`text-center text-sm ${textSecondary}`}>
                <p>Last updated: January 1, 2026</p>
                <p className="mt-1">
                    Questions about our policies?{' '}
                    <a href="mailto:legal@devision.com" className={`${isDark ? 'text-primary-400' : 'text-primary-600'} hover:underline`}>
                        Contact us
                    </a>
                </p>
            </div>

            {/* Fullscreen Modal */}
            {fullScreenDoc && (
                <div className="fixed inset-0 z-[9999] flex flex-col">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={closeFullScreen}
                    />

                    {/* Modal Content */}
                    <div className={`
                        relative flex flex-col h-full m-4 md:m-8 rounded-2xl overflow-hidden
                        ${isDark ? 'bg-dark-900' : 'bg-white'}
                    `}>
                        {/* Header */}
                        <div className={`
                            flex items-center justify-between px-6 py-4 border-b flex-shrink-0
                            ${isDark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-gray-50'}
                        `}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${getColorClasses(fullScreenDoc.color, isDark)}`}>
                                    <fullScreenDoc.icon className="w-5 h-5" />
                                </div>
                                <h2 className={`text-lg font-bold ${textPrimary}`}>{fullScreenDoc.label}</h2>
                            </div>
                            <button
                                onClick={closeFullScreen}
                                className={`
                                    p-2 rounded-xl transition-colors
                                    ${isDark ? 'hover:bg-dark-700 text-dark-400 hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div
                            id="fullscreen-content"
                            className={`
                                flex-1 overflow-y-auto p-6 md:p-8 lg:p-12
                                ${isDark ? 'bg-dark-900' : 'bg-white'}
                            `}
                        >
                            <div className="max-w-4xl mx-auto">
                                <fullScreenDoc.Component />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`
                            flex items-center justify-between px-6 py-3 border-t flex-shrink-0
                            ${isDark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-gray-50'}
                        `}>
                            <span className={`text-sm ${textSecondary}`}>
                                Last updated: January 1, 2026
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => document.getElementById('fullscreen-content').scrollTo({ top: 0, behavior: 'smooth' })}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                                        transition-colors
                                        ${isDark
                                            ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }
                                    `}
                                >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                    Back to top
                                </button>
                                <button
                                    onClick={closeFullScreen}
                                    className="px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

