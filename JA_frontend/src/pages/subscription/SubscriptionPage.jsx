/**
 * Subscription Page
 * 
 * Premium subscription overview and management.
 * Implements Requirements 5.x for subscription features.
 * 
 * Features:
 * - Display subscription status
 * - Show pricing plans
 * - Link to payment and search profile
 * - Cancel subscription option
 * 
 * Architecture: 
 * - Uses HeadlessTabs for plan selection
 * - Uses HeadlessModal for confirmation dialogs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Crown, Check, Sparkles, Bell, Search, FileText,
    TrendingUp, Shield, Zap, ChevronRight, AlertCircle, X, CheckCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHeadlessTabs, useHeadlessModal } from '../../components/headless';
import { useAuth } from '../../context/AuthContext';
import subscriptionService from '../../services/SubscriptionService';
import CatLoadingSpinner from '../../components/common/CatLoadingSpinner';

const SubscriptionPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isDark } = useTheme();
    const { user } = useAuth();

    // State
    const [subscription, setSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [upgrading, setUpgrading] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState(null);

    // Headless hooks - tabs expects array of string IDs
    const TAB_CONFIG = [
        { id: 'overview', label: 'Overview' },
        { id: 'plans', label: 'Plans' },
        { id: 'billing', label: 'Billing History' },
    ];

    const tabs = useHeadlessTabs({
        tabs: TAB_CONFIG.map(t => t.id),
        defaultTab: 'overview',
    });

    const cancelModal = useHeadlessModal();

    // Handle Stripe payment redirect query params
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            setPaymentMessage({
                type: 'success',
                text: 'Payment successful! Your subscription has been activated. Thank you for upgrading to Premium!'
            });
            // Clear the query param from URL
            searchParams.delete('payment');
            setSearchParams(searchParams, { replace: true });
        } else if (paymentStatus === 'cancelled') {
            setPaymentMessage({
                type: 'info',
                text: 'Payment was cancelled. You can try again anytime.'
            });
            // Clear the query param from URL
            searchParams.delete('payment');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Fetch subscription data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statusRes, plansRes] = await Promise.all([
                subscriptionService.getSubscriptionStatus(),
                subscriptionService.getPlans(),
            ]);

            setSubscription(statusRes.data);
            setPlans(plansRes.data);
        } catch (err) {
            setError('Failed to load subscription data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // Handle cancel subscription
    const handleCancelSubscription = async () => {
        setCancelling(true);
        try {
            await subscriptionService.cancelSubscription();
            await fetchData();
            cancelModal.close();
        } catch (err) {
            setError('Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    // Handle upgrade to premium
    const handleUpgrade = async (planId) => {
        if (!user?.email) {
            setError('User information not available. Please log in again.');
            return;
        }

        setUpgrading(true);
        setError(null);

        try {
            // Map frontend plan ID to backend PlanType enum
            const planType = planId === 'monthly' || planId === 'yearly' ? 'PREMIUM' : 'FREEMIUM';

            // Call subscribe API with SubscriptionRequest
            // Backend will extract userId from JWT token
            const response = await subscriptionService.subscribe({
                email: user.email,
                planType: planType
            });

            // Extract paymentUrl from response
            const paymentUrl = response?.data?.paymentUrl || response?.paymentUrl;

            if (paymentUrl) {
                // Redirect to external payment gateway
                window.location.href = paymentUrl;
            } else {
                setError('Payment URL not received. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Failed to start subscription. Please try again.');
        } finally {
            setUpgrading(false);
        }
    };

    // Styles
    const cardClass = isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CatLoadingSpinner size="xl" message="Loading subscription..." />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Payment Result Banner */}
            {paymentMessage && (
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${paymentMessage.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}>
                    {paymentMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="flex-1">{paymentMessage.text}</span>
                    <button
                        onClick={() => setPaymentMessage(null)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}>
                        <Crown className="w-7 h-7 text-yellow-500" />
                        Premium Subscription
                    </h1>
                    <p className={`mt-1 ${textSecondary}`}>
                        Unlock powerful features to accelerate your job search
                    </p>
                </div>

                {subscription?.isPremium && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-500/30">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-yellow-500">Premium Active</span>
                    </div>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tab Navigation */}
            <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-dark-800' : 'bg-gray-100'}`}>
                {TAB_CONFIG.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => tabs.setActiveTab(tab.id)}
                        className={`
              flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${tabs.activeTab === tab.id
                                ? `bg-primary-600 text-white shadow-lg shadow-primary-600/30`
                                : `${isDark ? 'text-dark-300 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'}`
                            }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {/* Overview Tab */}
                {tabs.activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Current Status Card */}
                        <div className={`p-6 rounded-2xl border ${cardClass}`}>
                            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Current Plan</h2>

                            {subscription?.isPremium ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
                                                <Crown className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${textPrimary}`}>Premium {subscription.plan}</p>
                                                <p className={`text-sm ${textSecondary}`}>
                                                    ${subscription.price}/month
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.status === 'active'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {subscription.status === 'active' ? 'Active' : 'Cancelled'}
                                        </span>
                                    </div>

                                    <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
                                        <div className="flex justify-between text-sm">
                                            <span className={textSecondary}>Next billing date</span>
                                            <span className={textPrimary}>
                                                {new Date(subscription.renewalDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate('/dashboard/subscription/search-profile')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
                                        >
                                            <Search className="w-4 h-4" />
                                            Manage Search Profile
                                        </button>

                                        {subscription.status === 'active' && (
                                            <button
                                                onClick={cancelModal.open}
                                                className={`px-4 py-3 rounded-xl border font-medium transition-colors ${isDark
                                                    ? 'border-dark-600 text-dark-300 hover:text-red-400 hover:border-red-500/50'
                                                    : 'border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300'
                                                    }`}
                                            >
                                                Cancel Plan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 mb-4">
                                        <Crown className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>
                                        You're on the Free Plan
                                    </h3>
                                    <p className={`mb-6 ${textSecondary}`}>
                                        Upgrade to Premium to unlock powerful job search features
                                    </p>
                                    <button
                                        onClick={() => handleUpgrade('monthly')}
                                        disabled={upgrading}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        {upgrading ? 'Processing...' : 'Upgrade to Premium'}
                                        {!upgrading && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { icon: Bell, title: 'Real-time Alerts', desc: 'Get notified instantly for matching jobs', premium: true },
                                { icon: Search, title: 'Advanced Search', desc: 'Custom search profiles with saved criteria', premium: true },
                                { icon: FileText, title: 'Unlimited Applications', desc: 'Apply to unlimited job posts', premium: true },
                                { icon: TrendingUp, title: 'Priority Visibility', desc: 'Stand out to employers', premium: true },
                                { icon: Shield, title: 'Profile Verification', desc: 'Verified badge on your profile', premium: true },
                                { icon: Zap, title: 'Early Access', desc: 'Get new features first', premium: true },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl border ${cardClass} ${!subscription?.isPremium ? 'opacity-60' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${subscription?.isPremium
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : isDark ? 'bg-dark-700 text-dark-400' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            <feature.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-medium ${textPrimary}`}>{feature.title}</p>
                                            <p className={`text-sm ${textSecondary}`}>{feature.desc}</p>
                                        </div>
                                        {subscription?.isPremium && (
                                            <Check className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Plans Tab */}
                {tabs.activeTab === 'plans' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <PricingCard
                                key={plan.id}
                                plan={plan}
                                isCurrentPlan={subscription?.isPremium && subscription?.plan?.toLowerCase() === plan.id}
                                onSelect={() => handleUpgrade(plan.id)}
                                upgrading={upgrading}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                )}

                {/* Billing History Tab */}
                {tabs.activeTab === 'billing' && (
                    <BillingHistory isDark={isDark} />
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {cancelModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`w-full max-w-md p-6 rounded-2xl ${cardClass} border shadow-2xl`}>
                        <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>
                            Cancel Subscription?
                        </h3>
                        <p className={`mb-6 ${textSecondary}`}>
                            You will lose access to all premium features at the end of your current billing period.
                            Are you sure you want to cancel?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelModal.close}
                                className={`flex-1 px-4 py-2.5 rounded-xl border font-medium transition-colors ${isDark ? 'border-dark-600 text-dark-300 hover:bg-dark-700' : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Keep Subscription
                            </button>
                            <button
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Pricing Card Component
 */
const PricingCard = ({ plan, isCurrentPlan, onSelect, upgrading, isDark }) => {
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    return (
        <div className={`
      relative p-6 rounded-2xl border-2 transition-all
      ${plan.popular
                ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                : isDark ? 'border-dark-700' : 'border-gray-200'
            }
      ${isDark ? 'bg-dark-800' : 'bg-white'}
    `}>
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                        Most Popular
                    </span>
                </div>
            )}

            {plan.savings && (
                <div className="absolute -top-3 right-4">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Save {plan.savings}
                    </span>
                </div>
            )}

            <div className="text-center mb-6">
                <h3 className={`text-xl font-bold ${textPrimary}`}>{plan.name}</h3>
                <div className="mt-4">
                    <span className={`text-4xl font-bold ${textPrimary}`}>${plan.price}</span>
                    <span className={`${textSecondary}`}>/{plan.interval}</span>
                </div>
                {plan.id === 'yearly' && (
                    <p className={`text-sm mt-1 ${textSecondary}`}>
                        That's just $8/month
                    </p>
                )}
            </div>

            <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className={textSecondary}>{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onSelect}
                disabled={isCurrentPlan || upgrading}
                className={`
          w-full py-3 rounded-xl font-semibold transition-all
          ${isCurrentPlan || upgrading
                        ? `${isDark ? 'bg-dark-700 text-dark-400' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                        : plan.popular
                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30'
                            : isDark
                                ? 'bg-dark-700 hover:bg-dark-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }
        `}
            >
                {isCurrentPlan ? 'Current Plan' : upgrading ? 'Processing...' : 'Get Started'}
            </button>
        </div>
    );
};

/**
 * Billing History Component
 */
const BillingHistory = ({ isDark }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await subscriptionService.getPaymentHistory();
                setHistory(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <CatLoadingSpinner size="lg" message="Loading billing history..." />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className={`text-center py-12 ${isDark ? 'bg-dark-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                <FileText className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
                <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>No Billing History</h3>
                <p className={textSecondary}>Your payment history will appear here once you subscribe.</p>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
            <table className="w-full">
                <thead className={isDark ? 'bg-dark-900' : 'bg-gray-50'}>
                    <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Date</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Description</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Amount</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                    {history.map((payment) => (
                        <tr key={payment.id}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimary}`}>
                                {new Date(payment.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </td>
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>
                                {payment.description}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textPrimary}`}>
                                ${payment.amount.toFixed(2)} {payment.currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'completed'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {payment.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubscriptionPage;
