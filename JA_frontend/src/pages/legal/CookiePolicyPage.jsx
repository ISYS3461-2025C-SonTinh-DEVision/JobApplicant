/**
 * Cookie Policy Standalone Page
 * 
 * Accessible from the Cookie Consent Banner "Learn More" button.
 * Displays comprehensive cookie policy content in a standalone page.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie, Shield, Lock, Eye, Settings, BarChart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function CookiePolicyPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-300' : 'text-gray-600';
    const headingClass = `text-lg font-semibold ${textPrimary} mt-8 mb-4`;
    const paragraphClass = `${textSecondary} leading-relaxed mb-4`;
    const listClass = `${textSecondary} ml-6 mb-4 space-y-2 list-disc`;
    const cardClass = isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200';

    const cookieTypes = [
        {
            icon: Shield,
            name: 'Essential Cookies',
            description: 'Required for basic site functionality, authentication, and security. These cookies are necessary for the website to function and cannot be disabled.',
            examples: ['devision_auth', 'devision_session', 'csrf_token'],
            color: 'from-green-500/20 to-green-600/20 text-green-400',
        },
        {
            icon: Settings,
            name: 'Functional Cookies',
            description: 'Remember your preferences such as theme settings, language, and layout choices to provide a personalized experience.',
            examples: ['devision_theme', 'sidebar_collapsed', 'cookie_consent'],
            color: 'from-blue-500/20 to-blue-600/20 text-blue-400',
        },
        {
            icon: BarChart,
            name: 'Analytics Cookies',
            description: 'Help us understand how visitors interact with our site by collecting anonymous usage data. This helps us improve our services.',
            examples: ['_ga', '_gid', 'analytics_session'],
            color: 'from-purple-500/20 to-purple-600/20 text-purple-400',
        },
        {
            icon: Eye,
            name: 'Marketing Cookies',
            description: 'Track your activity across sites to deliver relevant advertisements and measure the effectiveness of our marketing campaigns.',
            examples: ['_fbp', 'ads_session', 'campaign_id'],
            color: 'from-amber-500/20 to-amber-600/20 text-amber-400',
        },
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <header className={`
                sticky top-0 z-30 backdrop-blur-sm border-b
                ${isDark ? 'bg-dark-800/95 border-dark-700' : 'bg-white/95 border-gray-200'}
            `}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className={`
                                p-2 rounded-lg transition-colors
                                ${isDark ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'}
                            `}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center
                                ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}
                            `}>
                                <Cookie className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                            </div>
                            <div>
                                <h1 className={`text-xl font-bold ${textPrimary}`}>Cookie Policy</h1>
                                <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                    Last updated: January 1, 2026
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Introduction */}
                <div className={`rounded-2xl border p-6 mb-8 ${cardClass}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                        <h2 className={`text-lg font-semibold ${textPrimary}`}>Your Privacy Matters</h2>
                    </div>
                    <p className={paragraphClass}>
                        At DEVision, we are committed to protecting your privacy and being transparent about how we use cookies and similar technologies. This policy explains what cookies are, how we use them, and how you can manage your preferences.
                    </p>
                    <p className={paragraphClass}>
                        By continuing to use DEVision, you consent to the use of cookies as described in this policy. We use only essential cookies by default and respect your choices regarding optional cookies.
                    </p>
                </div>

                {/* What Are Cookies */}
                <h2 className={headingClass}>What Are Cookies?</h2>
                <p className={paragraphClass}>
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They serve many purposes: remembering your login status, storing your preferences, providing security features, and helping us understand how you use our platform.
                </p>
                <p className={paragraphClass}>
                    Cookies can be categorized as:
                </p>
                <ul className={listClass}>
                    <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
                    <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until you delete them</li>
                    <li><strong>First-party Cookies:</strong> Cookies set by DEVision directly</li>
                    <li><strong>Third-party Cookies:</strong> Cookies set by our trusted partners for analytics and security</li>
                </ul>

                {/* Types of Cookies */}
                <h2 className={headingClass}>Types of Cookies We Use</h2>
                <div className="grid gap-4 sm:grid-cols-2 mb-8">
                    {cookieTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <div key={type.name} className={`rounded-2xl border p-5 ${cardClass}`}>
                                <div className={`
                                    w-10 h-10 rounded-xl mb-3 flex items-center justify-center
                                    bg-gradient-to-br ${type.color}
                                `}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className={`font-semibold mb-2 ${textPrimary}`}>{type.name}</h3>
                                <p className={`text-sm mb-3 ${textSecondary}`}>{type.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {type.examples.map((example) => (
                                        <span
                                            key={example}
                                            className={`
                                                text-xs px-2 py-1 rounded-full font-mono
                                                ${isDark ? 'bg-dark-700 text-dark-300' : 'bg-gray-100 text-gray-600'}
                                            `}
                                        >
                                            {example}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Specific Cookies Table */}
                <h2 className={headingClass}>Detailed Cookie List</h2>
                <div className={`rounded-2xl border overflow-hidden mb-8 ${cardClass}`}>
                    <table className="w-full text-sm">
                        <thead className={isDark ? 'bg-dark-700' : 'bg-gray-100'}>
                            <tr>
                                <th className={`text-left p-4 font-semibold ${textPrimary}`}>Cookie Name</th>
                                <th className={`text-left p-4 font-semibold ${textPrimary}`}>Type</th>
                                <th className={`text-left p-4 font-semibold ${textPrimary} hidden sm:table-cell`}>Duration</th>
                                <th className={`text-left p-4 font-semibold ${textPrimary}`}>Purpose</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-200'}`}>
                            <tr>
                                <td className={`p-4 font-mono text-xs ${textPrimary}`}>devision_auth</td>
                                <td className={`p-4 ${textSecondary}`}>Essential</td>
                                <td className={`p-4 ${textSecondary} hidden sm:table-cell`}>Session</td>
                                <td className={`p-4 ${textSecondary}`}>Stores your authentication token for secure login</td>
                            </tr>
                            <tr>
                                <td className={`p-4 font-mono text-xs ${textPrimary}`}>devision_refresh</td>
                                <td className={`p-4 ${textSecondary}`}>Essential</td>
                                <td className={`p-4 ${textSecondary} hidden sm:table-cell`}>7 days</td>
                                <td className={`p-4 ${textSecondary}`}>Refresh token for maintaining session</td>
                            </tr>
                            <tr>
                                <td className={`p-4 font-mono text-xs ${textPrimary}`}>devision_theme</td>
                                <td className={`p-4 ${textSecondary}`}>Functional</td>
                                <td className={`p-4 ${textSecondary} hidden sm:table-cell`}>1 year</td>
                                <td className={`p-4 ${textSecondary}`}>Remembers your dark/light mode preference</td>
                            </tr>
                            <tr>
                                <td className={`p-4 font-mono text-xs ${textPrimary}`}>devision_sidebar</td>
                                <td className={`p-4 ${textSecondary}`}>Functional</td>
                                <td className={`p-4 ${textSecondary} hidden sm:table-cell`}>1 year</td>
                                <td className={`p-4 ${textSecondary}`}>Stores sidebar collapsed/expanded state</td>
                            </tr>
                            <tr>
                                <td className={`p-4 font-mono text-xs ${textPrimary}`}>devision_consent</td>
                                <td className={`p-4 ${textSecondary}`}>Essential</td>
                                <td className={`p-4 ${textSecondary} hidden sm:table-cell`}>1 year</td>
                                <td className={`p-4 ${textSecondary}`}>Records your cookie consent preference</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Third Party Cookies */}
                <h2 className={headingClass}>Third-Party Cookies</h2>
                <p className={paragraphClass}>
                    We use trusted third-party services that may set their own cookies:
                </p>
                <ul className={listClass}>
                    <li><strong>Google Analytics:</strong> For understanding site usage and improving our services</li>
                    <li><strong>Stripe:</strong> For secure payment processing when subscribing to Premium</li>
                    <li><strong>Google OAuth:</strong> For single sign-on authentication with your Google account</li>
                    <li><strong>Cloudflare:</strong> For security and performance optimization</li>
                </ul>
                <p className={paragraphClass}>
                    These third-party cookies are governed by the respective privacy policies of those providers. We encourage you to review their policies for more information.
                </p>

                {/* Managing Cookies */}
                <h2 className={headingClass}>Managing Your Cookie Preferences</h2>
                <p className={paragraphClass}>
                    You have control over the cookies stored on your device. Here are your options:
                </p>
                <div className={`rounded-2xl border p-6 mb-4 ${cardClass}`}>
                    <h3 className={`font-semibold mb-3 ${textPrimary}`}>Browser Settings</h3>
                    <ul className={listClass}>
                        <li>View and delete existing cookies</li>
                        <li>Block all cookies or specific types</li>
                        <li>Set preferences for first-party vs third-party cookies</li>
                        <li>Enable "Do Not Track" requests</li>
                    </ul>
                    <p className={`text-sm ${textSecondary}`}>
                        <strong>Note:</strong> Blocking essential cookies may prevent you from using certain features of DEVision, including logging in and accessing your dashboard.
                    </p>
                </div>

                {/* Updates */}
                <h2 className={headingClass}>Policy Updates</h2>
                <p className={paragraphClass}>
                    We may update this Cookie Policy periodically to reflect changes in technology, legislation, or our business practices. When we make significant changes, we will notify you through a banner on our website or via email if you have an account.
                </p>

                {/* Contact */}
                <h2 className={headingClass}>Contact Us</h2>
                <p className={paragraphClass}>
                    If you have any questions about our use of cookies or this policy, please contact us:
                </p>
                <div className={`rounded-2xl border p-6 ${cardClass}`}>
                    <p className={textSecondary}>
                        <strong>Email:</strong> privacy@devision.com<br />
                        <strong>Address:</strong> DEVision Job Platform, 123 Tech Street, Ho Chi Minh City, Vietnam
                    </p>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </main>
        </div>
    );
}
