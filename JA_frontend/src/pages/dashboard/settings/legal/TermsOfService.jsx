/**
 * Terms of Service
 * 
 * Comprehensive terms of service for DEVision platform.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';

export default function TermsOfService() {
    const { isDark } = useTheme();
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-300' : 'text-gray-600';
    const headingClass = `font-semibold ${textPrimary} mt-6 mb-3`;
    const paragraphClass = `${textSecondary} leading-relaxed mb-4`;
    const listClass = `${textSecondary} ml-6 mb-4 space-y-2 list-disc`;

    return (
        <div className="prose prose-sm max-w-none">
            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'} mb-4`}>
                <strong>Effective Date:</strong> January 1, 2026 | <strong>Last Updated:</strong> January 1, 2026
            </p>

            <p className={paragraphClass}>
                Welcome to DEVision ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the DEVision platform, including our website, mobile applications, and all related services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>

            <h3 className={headingClass}>1. Acceptance of Terms</h3>
            <p className={paragraphClass}>
                By creating an account or using DEVision, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not use our Service. We reserve the right to update these Terms at any time, and your continued use of the Service constitutes acceptance of any modifications.
            </p>

            <h3 className={headingClass}>2. Description of Service</h3>
            <p className={paragraphClass}>
                DEVision is a professional job matching platform designed to connect job applicants in Computer Science fields with potential employers. Our Service includes:
            </p>
            <ul className={listClass}>
                <li>Job search and application features</li>
                <li>Profile creation and management</li>
                <li>Resume and portfolio hosting</li>
                <li>Real-time job matching notifications (Premium)</li>
                <li>Communication tools between applicants and employers</li>
                <li>Premium subscription services with enhanced features</li>
            </ul>

            <h3 className={headingClass}>3. Account Registration and Eligibility</h3>
            <p className={paragraphClass}>
                To use certain features of our Service, you must register for an account. You agree to:
            </p>
            <ul className={listClass}>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className={paragraphClass}>
                You must be at least 18 years old to create an account. By using DEVision, you represent that you meet this age requirement.
            </p>

            <h3 className={headingClass}>4. User Conduct</h3>
            <p className={paragraphClass}>
                You agree to use DEVision responsibly and in compliance with all applicable laws. You may not:
            </p>
            <ul className={listClass}>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Impersonate any person or misrepresent your affiliation</li>
                <li>Harass, abuse, or discriminate against other users</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Scrape, collect, or harvest user data without permission</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any intellectual property rights</li>
            </ul>

            <h3 className={headingClass}>5. Premium Subscription</h3>
            <p className={paragraphClass}>
                DEVision offers premium subscription plans that provide enhanced features, including real-time job notifications, advanced search profiles, and priority visibility. By subscribing to a premium plan:
            </p>
            <ul className={listClass}>
                <li>You authorize us to charge your payment method on a recurring basis</li>
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>You may cancel your subscription at any time through account settings</li>
                <li>Refunds are provided in accordance with our Refund Policy</li>
                <li>Premium features are subject to change with reasonable notice</li>
            </ul>

            <h3 className={headingClass}>6. Intellectual Property</h3>
            <p className={paragraphClass}>
                All content, features, and functionality of DEVision, including but not limited to text, graphics, logos, and software, are owned by DEVision and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, modify, or distribute any content from our Service without prior written consent.
            </p>

            <h3 className={headingClass}>7. User Content</h3>
            <p className={paragraphClass}>
                You retain ownership of content you submit to DEVision (including resumes, portfolios, and profile information). By submitting content, you grant DEVision a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with providing our Service.
            </p>

            <h3 className={headingClass}>8. Termination</h3>
            <p className={paragraphClass}>
                We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion. Upon termination, your right to use the Service will immediately cease, and you will lose access to your account and any stored data.
            </p>

            <h3 className={headingClass}>9. Limitation of Liability</h3>
            <p className={paragraphClass}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEVISION SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO DEVISION IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>

            <h3 className={headingClass}>10. Dispute Resolution</h3>
            <p className={paragraphClass}>
                Any disputes arising from these Terms or your use of DEVision shall be resolved through binding arbitration in accordance with the rules of the Vietnam International Arbitration Centre. The arbitration shall take place in Ho Chi Minh City, Vietnam, and the language of arbitration shall be English.
            </p>

            <h3 className={headingClass}>11. Contact Information</h3>
            <p className={paragraphClass}>
                If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className={paragraphClass}>
                <strong>Email:</strong> legal@devision.com<br />
                <strong>Address:</strong> 702 Nguyen Van Linh, District 7, Ho Chi Minh City, Vietnam
            </p>
        </div>
    );
}
