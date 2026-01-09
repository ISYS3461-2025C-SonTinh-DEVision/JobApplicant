/**
 * Cookie Consent Banner Component
 * 
 * Displays a one-time popup to inform users about cookie usage.
 * - Only shows once per visitor (stored in localStorage)
 * - Only "Accept" button available (mandatory consent)
 * - Beautiful design with dark/light mode support
 * - Hidden on /cookie-policy page to not obstruct reading
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Cookie, Shield, ChevronRight, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const COOKIE_CONSENT_KEY = 'devision_cookie_consent';

export default function CookieConsentBanner() {
    const { isDark } = useTheme();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Hide on cookie policy pages
    const isCookiePolicyPage = location.pathname.includes('cookie-policy') || location.pathname.includes('cookie-policy');

    // Check if user has already accepted cookies
    useEffect(() => {
        const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!hasConsent && !isCookiePolicyPage) {
            // Small delay for smooth entrance animation
            const timer = setTimeout(() => {
                setIsVisible(true);
                setIsAnimating(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isCookiePolicyPage]);

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

    if (!isVisible || isCookiePolicyPage) return null;

    return (
        <div className={`
            fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4
            transition-all duration-300 ease-out
            ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}>
            {/* Backdrop - subtle */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

            {/* Banner - Compact */}
            <div className={`
                relative max-w-2xl mx-auto rounded-xl border shadow-xl overflow-hidden
                ${isDark
                    ? 'bg-dark-800/95 backdrop-blur-xl border-dark-700'
                    : 'bg-white/95 backdrop-blur-xl border-gray-200'
                }
            `}>
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />

                <div className="p-4">
                    <div className="flex items-center gap-4">
                        {/* Icon - smaller */}
                        <div className={`
                            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                            ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}
                        `}>
                            <Cookie className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                        </div>

                        {/* Content - inline */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex-1">
                                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        🍪 We Use Cookies
                                    </h3>
                                    <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                        For secure auth & personalized recommendations
                                    </p>
                                </div>

                                {/* Actions - inline */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <a
                                        href="/cookie-policy"
                                        className={`
                                            text-xs font-medium transition-colors
                                            ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
                                        `}
                                    >
                                        Learn More
                                    </a>
                                    <button
                                        onClick={handleAccept}
                                        className={`
                                            inline-flex items-center gap-1.5 
                                            px-4 py-2 rounded-lg text-sm font-medium text-white
                                            bg-gradient-to-r from-primary-500 to-primary-600 
                                            hover:from-primary-600 hover:to-primary-700
                                            shadow-md shadow-primary-500/20
                                            transition-all duration-200 hover:scale-[1.02]
                                        `}
                                    >
                                        Accept
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
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
