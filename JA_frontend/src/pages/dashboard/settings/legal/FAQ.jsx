/**
 * FAQ (Frequently Asked Questions)
 * 
 * Common questions and answers organized by category.
 * Uses accordion pattern for expandable sections.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React, { useState } from 'react';
import { ChevronDown, Search, User, Briefcase, Crown, Shield, CreditCard, HelpCircle } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

const FAQ_DATA = [
    {
        category: 'Account & Profile',
        icon: User,
        questions: [
            {
                q: 'How do I create a DEVision account?',
                a: 'Click the "Sign Up" button on our homepage. You can register using your email address or through Google SSO. After registration, you\'ll receive a verification email to activate your account.'
            },
            {
                q: 'Can I change my email address?',
                a: 'Yes, you can change your email address in Settings > Security. You\'ll need to verify both your current and new email addresses using OTP codes for security.'
            },
            {
                q: 'How do I reset my password?',
                a: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. The link expires after 24 hours for security.'
            },
            {
                q: 'Can I delete my account?',
                a: 'Yes, you can delete your account in Settings > Privacy > Danger Zone. Please note this action is permanent and all your data will be removed.'
            },
        ]
    },
    {
        category: 'Job Search & Applications',
        icon: Briefcase,
        questions: [
            {
                q: 'How do I search for jobs?',
                a: 'Use the Jobs page to search by job title, location, employment type, and salary range. You can also use our full-text search to find jobs matching specific skills in the description.'
            },
            {
                q: 'How do I apply for a job?',
                a: 'Click on any job listing to view details, then click "Apply Now". You can include a cover letter with your application. Your profile information is automatically included.'
            },
            {
                q: 'Can I track my applications?',
                a: 'Yes! Go to Dashboard > My Applications to see all your submitted applications, their status, and any updates from employers.'
            },
            {
                q: 'What does "Fresher Friendly" mean?',
                a: 'Jobs marked as "Fresher Friendly" are suitable for recent graduates or those with limited work experience. These positions often provide training and mentorship.'
            },
        ]
    },
    {
        category: 'Premium Subscription',
        icon: Crown,
        questions: [
            {
                q: 'What are the benefits of Premium?',
                a: 'Premium members get real-time job notifications via WebSocket, advanced search profiles, priority visibility to employers, instant alerts for matching jobs, and early access to new features.'
            },
            {
                q: 'How much does Premium cost?',
                a: 'Premium subscription is $10/month. We offer a 7-day satisfaction guarantee for new subscribers.'
            },
            {
                q: 'How do I cancel my subscription?',
                a: 'Go to Dashboard > Subscription and click "Cancel Plan". Your Premium access will continue until the end of your current billing period.'
            },
            {
                q: 'What is a Search Profile?',
                a: 'Premium members can create Search Profiles that specify their ideal job criteria (skills, location, salary, employment type). When new jobs match these criteria, you receive instant notifications.'
            },
        ]
    },
    {
        category: 'Payments & Billing',
        icon: CreditCard,
        questions: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept major credit/debit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through our payment partners.'
            },
            {
                q: 'Is my payment information secure?',
                a: 'Absolutely. We never store your full credit card details. All payment processing is handled by PCI-compliant third-party providers (Stripe/PayPal).'
            },
            {
                q: 'How do I get a refund?',
                a: 'New subscribers can request a full refund within 7 days of their first payment. Email billing@devision.com with your account email and transaction details.'
            },
            {
                q: 'Will I be charged automatically?',
                a: 'Yes, Premium subscriptions renew automatically. You\'ll receive an email reminder before each renewal. You can cancel anytime before the renewal date.'
            },
        ]
    },
    {
        category: 'Privacy & Security',
        icon: Shield,
        questions: [
            {
                q: 'Who can see my profile?',
                a: 'You control your profile visibility in Settings > Privacy. Options include Public (all employers), Connections Only (connected companies), or Private (hidden from searches).'
            },
            {
                q: 'How do you protect my data?',
                a: 'We use industry-standard encryption (TLS/SSL), secure JWT tokens for authentication, and regular security audits. Your data is stored on secure, redundant servers.'
            },
            {
                q: 'Can I download my data?',
                a: 'Yes, you can request a copy of all your DEVision data in Settings > Privacy > Your Data. The export includes your profile, applications, and activity history.'
            },
            {
                q: 'Do you share my information with employers?',
                a: 'Only when you apply for a job or have your profile set to Public. We never sell your personal information to third parties.'
            },
        ]
    },
];

export default function FAQ() {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedItems, setExpandedItems] = useState({});

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-300' : 'text-gray-600';
    const borderColor = isDark ? 'border-dark-700' : 'border-gray-200';
    const cardBg = isDark ? 'bg-dark-700/30' : 'bg-gray-50';

    const toggleItem = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Filter questions based on search
    const filteredData = searchQuery
        ? FAQ_DATA.map(category => ({
            ...category,
            questions: category.questions.filter(
                q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.a.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(category => category.questions.length > 0)
        : FAQ_DATA;

    return (
        <div className="space-y-6">
            {/* Search Box */}
            <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`
                        w-full pl-10 pr-4 py-3 rounded-xl border transition-colors
                        ${isDark
                            ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500'
                        }
                        outline-none
                    `}
                />
            </div>

            {/* FAQ Categories */}
            {filteredData.length > 0 ? (
                <div className="space-y-6">
                    {filteredData.map((category, categoryIndex) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.category}>
                                {/* Category Header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className={`w-4 h-4 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                                    <h4 className={`font-semibold text-sm ${textPrimary}`}>{category.category}</h4>
                                </div>

                                {/* Questions */}
                                <div className={`rounded-xl border ${borderColor} overflow-hidden divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                                    {category.questions.map((item, questionIndex) => {
                                        const key = `${categoryIndex}-${questionIndex}`;
                                        const isExpanded = expandedItems[key];

                                        return (
                                            <div key={questionIndex}>
                                                <button
                                                    onClick={() => toggleItem(categoryIndex, questionIndex)}
                                                    className={`
                                                        w-full flex items-center justify-between p-4 text-left transition-colors
                                                        ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'}
                                                    `}
                                                >
                                                    <span className={`font-medium pr-4 ${textPrimary}`}>{item.q}</span>
                                                    <ChevronDown
                                                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isDark ? 'text-dark-400' : 'text-gray-400'} ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </button>
                                                <div
                                                    className={`
                                                        overflow-hidden transition-all duration-200
                                                        ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                                    `}
                                                >
                                                    <div className={`px-4 pb-4 ${textSecondary}`}>
                                                        <p className="leading-relaxed">{item.a}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`text-center py-8 ${cardBg} rounded-xl`}>
                    <HelpCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-dark-500' : 'text-gray-400'}`} />
                    <p className={`font-medium ${textPrimary}`}>No results found</p>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Try a different search term</p>
                </div>
            )}

            {/* Still Need Help */}
            <div className={`p-4 rounded-xl ${cardBg} border ${borderColor} text-center`}>
                <p className={`font-medium ${textPrimary}`}>Still have questions?</p>
                <p className={`text-sm mt-1 ${textSecondary}`}>
                    Contact our support team at{' '}
                    <a href="mailto:support@devision.com" className={`${isDark ? 'text-primary-400' : 'text-primary-600'} hover:underline`}>
                        support@devision.com
                    </a>
                </p>
            </div>
        </div>
    );
}
