/**
 * Disclaimer
 * 
 * Service disclaimer and limitations of liability.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';

export default function Disclaimer() {
    const { isDark } = useTheme();
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-300' : 'text-gray-600';
    const headingClass = `font-semibold ${textPrimary} mt-6 mb-3`;
    const paragraphClass = `${textSecondary} leading-relaxed mb-4`;
    const listClass = `${textSecondary} ml-6 mb-4 space-y-2 list-disc`;
    const warningBox = isDark
        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
        : 'bg-yellow-50 border-yellow-200 text-yellow-700';

    return (
        <div className="prose prose-sm max-w-none">
            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'} mb-4`}>
                <strong>Effective Date:</strong> January 1, 2026 | <strong>Last Updated:</strong> January 1, 2026
            </p>

            <div className={`p-4 rounded-xl border mb-6 ${warningBox}`}>
                <p className="text-sm font-medium">
                    ⚠️ Please read this disclaimer carefully before using DEVision. By accessing and using our platform, you acknowledge that you have read, understood, and agree to this disclaimer.
                </p>
            </div>

            <h3 className={headingClass}>1. General Information</h3>
            <p className={paragraphClass}>
                The information provided on DEVision is for general informational purposes only. While we strive to keep the information up-to-date and accurate, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the platform or the information, products, services, or related graphics contained on the platform.
            </p>

            <h3 className={headingClass}>2. No Employment Guarantee</h3>
            <p className={paragraphClass}>
                DEVision is a platform that connects job applicants with potential employers. We do not guarantee:
            </p>
            <ul className={listClass}>
                <li>Employment or job placement for any user</li>
                <li>The accuracy of job postings or employer information</li>
                <li>The outcome of any application or interview process</li>
                <li>The qualifications or legitimacy of any employer or job posting</li>
                <li>Any specific salary, benefits, or working conditions</li>
            </ul>
            <p className={paragraphClass}>
                Users are solely responsible for verifying the legitimacy of any job opportunity, employer, or company before engaging in any employment relationship.
            </p>

            <h3 className={headingClass}>3. Third-Party Content</h3>
            <p className={paragraphClass}>
                DEVision may contain content, job postings, and information provided by third parties, including employers and other users. We do not control or endorse any third-party content and are not responsible for:
            </p>
            <ul className={listClass}>
                <li>The accuracy or reliability of third-party information</li>
                <li>Any actions taken by third parties</li>
                <li>Any losses or damages arising from third-party content</li>
                <li>External websites linked from our platform</li>
            </ul>

            <h3 className={headingClass}>4. Platform Availability</h3>
            <p className={paragraphClass}>
                We strive to maintain high availability of our platform, but we do not guarantee uninterrupted access. The platform may be unavailable due to:
            </p>
            <ul className={listClass}>
                <li>Scheduled maintenance and updates</li>
                <li>Technical difficulties or server issues</li>
                <li>Internet connectivity problems</li>
                <li>Force majeure events beyond our control</li>
            </ul>

            <h3 className={headingClass}>5. Limitation of Liability</h3>
            <p className={paragraphClass}>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <ul className={listClass}>
                <li>DEVision, its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>We shall not be liable for any loss of data, profits, revenue, or business opportunities</li>
                <li>Our total liability shall not exceed the amount you paid to DEVision in the 12 months prior to the claim</li>
                <li>We are not responsible for any user-generated content or third-party actions</li>
            </ul>

            <h3 className={headingClass}>6. Professional Advice</h3>
            <p className={paragraphClass}>
                The content on DEVision should not be construed as professional advice. We recommend consulting with appropriate professionals for:
            </p>
            <ul className={listClass}>
                <li>Legal advice regarding employment contracts or disputes</li>
                <li>Financial advice regarding salary negotiations</li>
                <li>Career guidance specific to your situation</li>
                <li>Immigration or visa-related matters</li>
            </ul>

            <h3 className={headingClass}>7. Changes to This Disclaimer</h3>
            <p className={paragraphClass}>
                We reserve the right to modify this disclaimer at any time. Any changes will be posted on this page with an updated revision date. Your continued use of DEVision after changes constitutes acceptance of the modified disclaimer.
            </p>

            <h3 className={headingClass}>8. Contact Information</h3>
            <p className={paragraphClass}>
                If you have any questions about this disclaimer, please contact us at:<br />
                <strong>Email:</strong> legal@devision.com
            </p>
        </div>
    );
}
