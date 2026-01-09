/**
 * Cookie Policy
 * 
 * Cookie usage policy for DEVision platform.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';

export default function CookiePolicy() {
    const { isDark } = useTheme();
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-300' : 'text-gray-600';
    const headingClass = `font-semibold ${textPrimary} mt-6 mb-3`;
    const paragraphClass = `${textSecondary} leading-relaxed mb-4`;
    const listClass = `${textSecondary} ml-6 mb-4 space-y-2 list-disc`;
    const tableClass = isDark
        ? 'border-dark-700 bg-dark-800'
        : 'border-gray-200 bg-gray-50';

    return (
        <div className="prose prose-sm max-w-none">
            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'} mb-4`}>
                <strong>Effective Date:</strong> January 1, 2026 | <strong>Last Updated:</strong> January 1, 2026
            </p>

            <p className={paragraphClass}>
                This Cookie Policy explains how DEVision uses cookies and similar tracking technologies when you visit our website and use our services. By continuing to use our platform, you consent to the use of cookies as described in this policy.
            </p>

            <h3 className={headingClass}>1. What Are Cookies?</h3>
            <p className={paragraphClass}>
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember your preferences and improve your browsing experience. Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (remain on your device for a set period).
            </p>

            <h3 className={headingClass}>2. Types of Cookies We Use</h3>

            <div className={`rounded-xl border overflow-hidden mb-4 ${tableClass}`}>
                <table className="w-full text-sm">
                    <thead className={isDark ? 'bg-dark-700' : 'bg-gray-100'}>
                        <tr>
                            <th className={`text-left p-3 font-semibold ${textPrimary}`}>Type</th>
                            <th className={`text-left p-3 font-semibold ${textPrimary}`}>Purpose</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-200'}`}>
                        <tr>
                            <td className={`p-3 font-medium ${textPrimary}`}>Essential</td>
                            <td className={`p-3 ${textSecondary}`}>Required for basic site functionality, authentication, and security. Cannot be disabled.</td>
                        </tr>
                        <tr>
                            <td className={`p-3 font-medium ${textPrimary}`}>Functional</td>
                            <td className={`p-3 ${textSecondary}`}>Remember your preferences (theme, language) for a better experience.</td>
                        </tr>
                        <tr>
                            <td className={`p-3 font-medium ${textPrimary}`}>Analytics</td>
                            <td className={`p-3 ${textSecondary}`}>Help us understand how visitors use our site to improve performance.</td>
                        </tr>
                        <tr>
                            <td className={`p-3 font-medium ${textPrimary}`}>Marketing</td>
                            <td className={`p-3 ${textSecondary}`}>Track your activity to deliver relevant advertisements and measure campaigns.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className={headingClass}>3. Specific Cookies We Use</h3>
            <ul className={listClass}>
                <li><strong>devision_auth:</strong> Essential - Stores your authentication token for secure login</li>
                <li><strong>devision_theme:</strong> Functional - Remembers your light/dark mode preference</li>
                <li><strong>devision_session:</strong> Essential - Maintains your session while browsing</li>
                <li><strong>_ga, _gid:</strong> Analytics - Google Analytics cookies for usage statistics</li>
            </ul>

            <h3 className={headingClass}>4. Third-Party Cookies</h3>
            <p className={paragraphClass}>
                We may use third-party services that set their own cookies, including:
            </p>
            <ul className={listClass}>
                <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Stripe/PayPal:</strong> For secure payment processing</li>
                <li><strong>Google OAuth:</strong> For single sign-on authentication</li>
            </ul>
            <p className={paragraphClass}>
                These third-party cookies are governed by the respective privacy policies of those providers.
            </p>

            <h3 className={headingClass}>5. Managing Cookies</h3>
            <p className={paragraphClass}>
                You can control and manage cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className={listClass}>
                <li>View what cookies are stored on your device</li>
                <li>Delete cookies individually or in bulk</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies from specific websites</li>
                <li>Set preferences for cookie acceptance</li>
            </ul>
            <p className={paragraphClass}>
                <strong>Note:</strong> Disabling essential cookies may affect the functionality of DEVision and prevent you from using certain features.
            </p>

            <h3 className={headingClass}>6. Similar Technologies</h3>
            <p className={paragraphClass}>
                In addition to cookies, we may use similar technologies such as:
            </p>
            <ul className={listClass}>
                <li><strong>Local Storage:</strong> For storing user preferences and cached data</li>
                <li><strong>Session Storage:</strong> For temporary data during your browsing session</li>
                <li><strong>Web Beacons:</strong> Small graphics to track email opens and link clicks</li>
            </ul>

            <h3 className={headingClass}>7. Updates to This Policy</h3>
            <p className={paragraphClass}>
                We may update this Cookie Policy periodically to reflect changes in technology, legislation, or our business practices. Please review this page regularly for the latest information.
            </p>

            <h3 className={headingClass}>8. Contact Us</h3>
            <p className={paragraphClass}>
                If you have questions about our use of cookies, please contact us at:<br />
                <strong>Email:</strong> privacy@devision.com
            </p>
        </div>
    );
}
