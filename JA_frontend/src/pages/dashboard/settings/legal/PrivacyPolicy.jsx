/**
 * Privacy Policy
 * 
 * Comprehensive privacy policy for DEVision platform.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';

export default function PrivacyPolicy() {
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
                At DEVision, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform.
            </p>

            <h3 className={headingClass}>1. Information We Collect</h3>

            <h4 className={`font-medium ${textPrimary} mt-4 mb-2`}>1.1 Information You Provide</h4>
            <ul className={listClass}>
                <li><strong>Account Information:</strong> Name, email address, password, phone number, and country</li>
                <li><strong>Profile Data:</strong> Education history, work experience, skills, certifications, and objectives</li>
                <li><strong>Application Materials:</strong> Resumes, cover letters, and portfolio items</li>
                <li><strong>Payment Information:</strong> Credit card details (processed securely by third-party providers)</li>
                <li><strong>Communications:</strong> Messages, feedback, and support requests</li>
            </ul>

            <h4 className={`font-medium ${textPrimary} mt-4 mb-2`}>1.2 Information Collected Automatically</h4>
            <ul className={listClass}>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, search queries, and interaction patterns</li>
                <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                <li><strong>Cookies and Tracking:</strong> Session cookies, analytics cookies, and similar technologies</li>
            </ul>

            <h3 className={headingClass}>2. How We Use Your Information</h3>
            <p className={paragraphClass}>We use your information to:</p>
            <ul className={listClass}>
                <li>Provide, maintain, and improve our Service</li>
                <li>Match you with relevant job opportunities</li>
                <li>Process your applications and notify you of updates</li>
                <li>Send you job alerts and notifications (based on your preferences)</li>
                <li>Process payments and manage subscriptions</li>
                <li>Communicate with you about your account and our Service</li>
                <li>Detect and prevent fraud, abuse, and security threats</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Comply with legal obligations</li>
            </ul>

            <h3 className={headingClass}>3. Information Sharing</h3>
            <p className={paragraphClass}>We may share your information with:</p>
            <ul className={listClass}>
                <li><strong>Employers:</strong> When you apply for jobs or make your profile visible to recruiters</li>
                <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform (payment processors, cloud hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> For any other purpose with your explicit permission</li>
            </ul>
            <p className={paragraphClass}>
                <strong>We do not sell your personal information to third parties.</strong>
            </p>

            <h3 className={headingClass}>4. Data Security</h3>
            <p className={paragraphClass}>
                We implement industry-standard security measures to protect your data, including:
            </p>
            <ul className={listClass}>
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure JSON Web Encryption (JWE) tokens for authentication</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and employee training on data protection</li>
                <li>Brute-force protection and account lockout mechanisms</li>
            </ul>

            <h3 className={headingClass}>5. Your Rights and Choices</h3>
            <p className={paragraphClass}>You have the right to:</p>
            <ul className={listClass}>
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your data in certain circumstances</li>
            </ul>

            <h3 className={headingClass}>6. Data Retention</h3>
            <p className={paragraphClass}>
                We retain your personal data for as long as your account is active or as needed to provide our Service. After account deletion, we may retain certain information as required by law or for legitimate business purposes (such as fraud prevention).
            </p>

            <h3 className={headingClass}>7. International Data Transfers</h3>
            <p className={paragraphClass}>
                Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with applicable laws.
            </p>

            <h3 className={headingClass}>8. Children's Privacy</h3>
            <p className={paragraphClass}>
                DEVision is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will promptly delete the information.
            </p>

            <h3 className={headingClass}>9. Changes to This Policy</h3>
            <p className={paragraphClass}>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the revised policy.
            </p>

            <h3 className={headingClass}>10. Contact Us</h3>
            <p className={paragraphClass}>
                For privacy-related inquiries or to exercise your rights, please contact us at:
            </p>
            <p className={paragraphClass}>
                <strong>Email:</strong> privacy@devision.com<br />
                <strong>Data Protection Officer:</strong> dpo@devision.com<br />
                <strong>Address:</strong> 702 Nguyen Van Linh, District 7, Ho Chi Minh City, Vietnam
            </p>
        </div>
    );
}
