/**
 * Refund Policy
 * 
 * Premium subscription refund terms and conditions.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';

export default function RefundPolicy() {
    const { isDark } = useTheme();
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-300' : 'text-gray-600';
    const headingClass = `font-semibold ${textPrimary} mt-6 mb-3`;
    const paragraphClass = `${textSecondary} leading-relaxed mb-4`;
    const listClass = `${textSecondary} ml-6 mb-4 space-y-2 list-disc`;
    const highlightBox = isDark
        ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
        : 'bg-primary-50 border-primary-200 text-primary-700';

    return (
        <div className="prose prose-sm max-w-none">
            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'} mb-4`}>
                <strong>Effective Date:</strong> January 1, 2026 | <strong>Last Updated:</strong> January 1, 2026
            </p>

            <div className={`p-4 rounded-xl border mb-6 ${highlightBox}`}>
                <p className="text-sm font-medium">
                    💡 DEVision offers a 7-day satisfaction guarantee for new Premium subscribers. If you're not satisfied, we'll provide a full refund within the first 7 days.
                </p>
            </div>

            <h3 className={headingClass}>1. Overview</h3>
            <p className={paragraphClass}>
                This Refund Policy applies to paid Premium subscription services offered by DEVision. We want you to be completely satisfied with our service, and we've designed this policy to be fair and transparent.
            </p>

            <h3 className={headingClass}>2. Premium Subscription Refunds</h3>

            <h4 className={`font-medium ${textPrimary} mt-4 mb-2`}>2.1 New Subscriptions (7-Day Guarantee)</h4>
            <p className={paragraphClass}>
                If you are a first-time Premium subscriber, you are eligible for a full refund within 7 days of your initial subscription purchase if:
            </p>
            <ul className={listClass}>
                <li>You have not used any Premium-exclusive features</li>
                <li>You submit your refund request within 7 days of the initial charge</li>
                <li>The subscription is cancelled before the refund is processed</li>
            </ul>

            <h4 className={`font-medium ${textPrimary} mt-4 mb-2`}>2.2 Recurring Subscriptions</h4>
            <p className={paragraphClass}>
                For ongoing monthly or annual subscriptions:
            </p>
            <ul className={listClass}>
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Your Premium access will continue until the end of the current billing period</li>
                <li>We do not provide partial refunds for unused portions of a billing period</li>
                <li>Cancellation takes effect at the end of the current billing cycle</li>
            </ul>

            <h3 className={headingClass}>3. Refund Eligibility</h3>
            <p className={paragraphClass}>Refunds may be granted in the following circumstances:</p>
            <ul className={listClass}>
                <li><strong>Technical Issues:</strong> Persistent platform problems that prevent you from using Premium features, verified by our support team</li>
                <li><strong>Duplicate Charges:</strong> If you were accidentally charged more than once for the same subscription</li>
                <li><strong>Unauthorized Transactions:</strong> If your account was compromised and an unauthorized purchase was made</li>
                <li><strong>Service Unavailability:</strong> Extended outages (more than 48 consecutive hours) affecting Premium features</li>
            </ul>

            <h3 className={headingClass}>4. Non-Refundable Situations</h3>
            <p className={paragraphClass}>Refunds will generally not be provided for:</p>
            <ul className={listClass}>
                <li>Change of mind after the 7-day satisfaction guarantee period</li>
                <li>Failure to cancel before the renewal date</li>
                <li>Inability to find a job (we do not guarantee employment)</li>
                <li>Account suspension or termination due to Terms of Service violations</li>
                <li>Subscription purchases made more than 30 days ago</li>
                <li>Previously refunded accounts requesting additional refunds</li>
            </ul>

            <h3 className={headingClass}>5. How to Request a Refund</h3>
            <p className={paragraphClass}>To request a refund:</p>
            <ol className={`${textSecondary} ml-6 mb-4 space-y-2 list-decimal`}>
                <li>Email our billing team at <strong>billing@devision.com</strong></li>
                <li>Include your account email address and transaction ID</li>
                <li>Describe the reason for your refund request</li>
                <li>Our team will review your request within 3-5 business days</li>
                <li>If approved, refunds will be processed to your original payment method</li>
            </ol>

            <h3 className={headingClass}>6. Refund Processing Time</h3>
            <p className={paragraphClass}>
                Once a refund is approved:
            </p>
            <ul className={listClass}>
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>PayPal:</strong> 3-5 business days</li>
                <li><strong>Bank Transfer:</strong> 7-14 business days</li>
            </ul>
            <p className={paragraphClass}>
                The exact timing depends on your financial institution and may vary.
            </p>

            <h3 className={headingClass}>7. Currency and Fees</h3>
            <p className={paragraphClass}>
                Refunds are processed in the original currency of the transaction. We do not compensate for:
            </p>
            <ul className={listClass}>
                <li>Currency exchange rate fluctuations</li>
                <li>Bank fees charged by your financial institution</li>
                <li>Currency conversion fees</li>
            </ul>

            <h3 className={headingClass}>8. Contact Us</h3>
            <p className={paragraphClass}>
                For refund inquiries or assistance, please contact our billing team:<br />
                <strong>Email:</strong> billing@devision.com<br />
                <strong>Response Time:</strong> Within 24-48 hours
            </p>
        </div>
    );
}
