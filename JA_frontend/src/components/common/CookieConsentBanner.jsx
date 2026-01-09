/**
 * Cookie Consent Banner Component
 * 
 * Displays a one-time popup to inform users about cookie usage.
 * - Only shows once per visitor (stored in localStorage)
 * - Only "Accept" button available (mandatory consent)
 * - Beautiful design with dark/light mode support
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

import React, { useState, useEffect } from 'react';
import { Cookie, Shield, ChevronRight, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const COOKIE_CONSENT_KEY = 'devision_cookie_consent';

export default function CookieConsentBanner() {
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Check if user has already accepted cookies
    useEffect(() => {
        const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!hasConsent) {
            // Small delay for smooth entrance animation
            const timer = setTimeout(() => {
                setIsVisible(true);
                setIsAnimating(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Handle accept
    const handleAccept = () => {
        setIsAnimating(false);
        setTimeout(() => {
            localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
                accepted: true,
                timestamp: new Date().toISOString(),
                version: '1.0'
            }));
            setIsVisible(false);
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <div className={`
            fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6
            transition-all duration-300 ease-out
            ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

            {/* Banner */}
            <div className={`
                relative max-w-4xl mx-auto rounded-2xl border shadow-2xl overflow-hidden
                ${isDark
                    ? 'bg-dark-800/95 backdrop-blur-xl border-dark-700'
                    : 'bg-white/95 backdrop-blur-xl border-gray-200'
                }
            `}>
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />

                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Icon */}
                        <div className={`
                            flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
                            ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}
                        `}>
                            <Cookie className={`w-7 h-7 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                🍪 We Use Cookies
                            </h3>
                            <p className={`mb-4 leading-relaxed ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                DEVision uses cookies to enhance your experience, provide personalized job recommendations,
                                and ensure secure authentication. By continuing to use our platform, you accept our use of cookies.
                            </p>

                            {/* Key points */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                {[
                                    { icon: Shield, label: 'Secure Authentication' },
                                    { icon: Cookie, label: 'Essential Cookies Only' },
                                ].map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={i}
                                            className={`
                                                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                                                ${isDark ? 'bg-dark-700 text-dark-300' : 'bg-gray-100 text-gray-600'}
                                            `}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {item.label}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <button
                                    onClick={handleAccept}
                                    className={`
                                        flex-1 sm:flex-none inline-flex items-center justify-center gap-2 
                                        px-8 py-3 rounded-xl font-semibold text-white
                                        bg-gradient-to-r from-primary-500 to-primary-600 
                                        hover:from-primary-600 hover:to-primary-700
                                        shadow-lg shadow-primary-500/30
                                        transition-all duration-200 hover:scale-[1.02]
                                    `}
                                >
                                    Accept & Continue
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                <a
                                    href="/cookie-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                        inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                        font-medium transition-colors
                                        ${isDark
                                            ? 'text-dark-300 hover:text-white hover:bg-dark-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    Learn More
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Utility function to check if cookies are accepted
export function hasCookieConsent() {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return false;
    try {
        const parsed = JSON.parse(consent);
        return parsed.accepted === true;
    } catch {
        return false;
    }
}

// Utility function to get consent details
export function getCookieConsentDetails() {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return null;
    try {
        return JSON.parse(consent);
    } catch {
        return null;
    }
}
