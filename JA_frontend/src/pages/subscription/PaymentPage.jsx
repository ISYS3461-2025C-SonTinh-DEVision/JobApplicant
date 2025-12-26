/**
 * Payment Page
 * 
 * Process premium subscription payment.
 * Implements Requirement 5.1.1 (monthly subscription via third-party payment).
 * 
 * Features:
 * - Credit card input form
 * - Payment processing (mock Stripe)
 * - Transaction confirmation
 * 
 * Architecture: Uses HeadlessForm for form management
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    CreditCard, Lock, ArrowLeft, Check, AlertCircle, Loader2,
    Shield
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHeadlessForm } from '../../components/headless';
import subscriptionService from '../../services/SubscriptionService';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark } = useTheme();

    const selectedPlanId = location.state?.planId || 'monthly';

    // State
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Form setup using HeadlessForm
    const form = useHeadlessForm({
        initialValues: {
            cardNumber: '',
            expiryMonth: '',
            expiryYear: '',
            cvc: '',
            cardholderName: '',
        },
        validate: (values) => {
            const errors = {};

            // Card number
            const cleanNumber = values.cardNumber.replace(/\s/g, '');
            if (!cleanNumber) {
                errors.cardNumber = 'Card number is required';
            } else if (!/^\d{16}$/.test(cleanNumber)) {
                errors.cardNumber = 'Invalid card number';
            }

            // Expiry
            if (!values.expiryMonth || !values.expiryYear) {
                errors.expiry = 'Expiry date is required';
            } else {
                const now = new Date();
                const currentYear = now.getFullYear() % 100;
                const currentMonth = now.getMonth() + 1;
                const month = parseInt(values.expiryMonth);
                const year = parseInt(values.expiryYear);

                if (month < 1 || month > 12) {
                    errors.expiry = 'Invalid month';
                } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    errors.expiry = 'Card has expired';
                }
            }

            // CVC
            if (!values.cvc) {
                errors.cvc = 'CVC is required';
            } else if (!/^\d{3,4}$/.test(values.cvc)) {
                errors.cvc = 'Invalid CVC';
            }

            // Cardholder name
            if (!values.cardholderName.trim()) {
                errors.cardholderName = 'Name is required';
            }

            return errors;
        },
        onSubmit: async (values) => {
            setProcessing(true);
            setError(null);

            try {
                // Process payment
                await subscriptionService.subscribe({
                    plan: selectedPlanId,
                    paymentMethodId: 'mock_pm_' + Date.now(),
                    cardDetails: values,
                });

                setSuccess(true);

                // Redirect after success animation
                setTimeout(() => {
                    navigate('/dashboard/subscription', {
                        state: { subscribed: true }
                    });
                }, 2000);
            } catch (err) {
                setError(err.message || 'Payment failed. Please try again.');
            } finally {
                setProcessing(false);
            }
        },
    });

    // Format card number with spaces
    const formatCardNumber = useCallback((value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    }, []);

    // Styles
    const cardClass = isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200';
    const inputClass = `
    w-full px-4 py-3 rounded-xl border outline-none transition-all
    ${isDark
            ? 'bg-dark-900 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
        }
  `;
    const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-dark-300' : 'text-gray-600'}`;
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    // Success state
    if (success) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-6">
                        <Check className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                        Payment Successful!
                    </h2>
                    <p className={textSecondary}>
                        Welcome to DEVision Premium. Redirecting...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-300' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Complete Payment</h1>
                    <p className={textSecondary}>Secure checkout powered by Stripe</p>
                </div>
            </div>

            {/* Order Summary */}
            <div className={`p-4 rounded-xl border ${cardClass}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`font-semibold ${textPrimary}`}>
                            DEVision Premium - {selectedPlanId === 'yearly' ? 'Yearly' : 'Monthly'}
                        </p>
                        <p className={`text-sm ${textSecondary}`}>
                            Billed {selectedPlanId === 'yearly' ? 'annually' : 'monthly'}
                        </p>
                    </div>
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                        ${selectedPlanId === 'yearly' ? '96' : '10'}
                        <span className={`text-sm ${textSecondary}`}>
                            /{selectedPlanId === 'yearly' ? 'year' : 'month'}
                        </span>
                    </p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Payment Form */}
            <form onSubmit={form.handleSubmit} className={`p-6 rounded-2xl border ${cardClass}`}>
                <div className="flex items-center gap-2 mb-6">
                    <CreditCard className={`w-5 h-5 ${textSecondary}`} />
                    <h2 className={`font-semibold ${textPrimary}`}>Payment Details</h2>
                    <Lock className={`w-4 h-4 ml-auto ${textSecondary}`} />
                </div>

                <div className="space-y-4">
                    {/* Card Number */}
                    <div>
                        <label className={labelClass}>Card Number</label>
                        <input
                            type="text"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formatCardNumber(form.values.cardNumber)}
                            onChange={(e) => form.setFieldValue('cardNumber', e.target.value)}
                            onBlur={() => form.validateField('cardNumber')}
                            maxLength={19}
                            className={`${inputClass} ${form.errors.cardNumber ? 'border-red-500' : ''}`}
                        />
                        {form.errors.cardNumber && (
                            <p className="mt-1 text-sm text-red-500">{form.errors.cardNumber}</p>
                        )}
                    </div>

                    {/* Cardholder Name */}
                    <div>
                        <label className={labelClass}>Cardholder Name</label>
                        <input
                            type="text"
                            name="cardholderName"
                            placeholder="John Doe"
                            value={form.values.cardholderName}
                            onChange={(e) => form.setFieldValue('cardholderName', e.target.value)}
                            className={`${inputClass} ${form.errors.cardholderName ? 'border-red-500' : ''}`}
                        />
                        {form.errors.cardholderName && (
                            <p className="mt-1 text-sm text-red-500">{form.errors.cardholderName}</p>
                        )}
                    </div>

                    {/* Expiry and CVC */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Month</label>
                            <select
                                name="expiryMonth"
                                value={form.values.expiryMonth}
                                onChange={(e) => form.setFieldValue('expiryMonth', e.target.value)}
                                className={`${inputClass} ${form.errors.expiry ? 'border-red-500' : ''}`}
                            >
                                <option value="">MM</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month.toString().padStart(2, '0')}>
                                        {month.toString().padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Year</label>
                            <select
                                name="expiryYear"
                                value={form.values.expiryYear}
                                onChange={(e) => form.setFieldValue('expiryYear', e.target.value)}
                                className={`${inputClass} ${form.errors.expiry ? 'border-red-500' : ''}`}
                            >
                                <option value="">YY</option>
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() % 100 + i).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>CVC</label>
                            <input
                                type="text"
                                name="cvc"
                                placeholder="123"
                                value={form.values.cvc}
                                onChange={(e) => form.setFieldValue('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                                className={`${inputClass} ${form.errors.cvc ? 'border-red-500' : ''}`}
                            />
                        </div>
                    </div>
                    {form.errors.expiry && (
                        <p className="text-sm text-red-500">{form.errors.expiry}</p>
                    )}
                    {form.errors.cvc && (
                        <p className="text-sm text-red-500">{form.errors.cvc}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className={`
            w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all
            flex items-center justify-center gap-2
            ${processing
                            ? 'bg-primary-600/50 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30'
                        }
          `}
                >
                    {processing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4" />
                            Pay ${selectedPlanId === 'yearly' ? '96' : '10'}.00
                        </>
                    )}
                </button>

                {/* Security Notice */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className={textSecondary}>
                        Your payment is secured with SSL encryption
                    </span>
                </div>
            </form>

            {/* Test Card Info */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
                <p className={`text-sm ${textSecondary}`}>
                    <span className="font-medium">Test Mode:</span> Use card number{' '}
                    <code className="px-1 py-0.5 bg-primary-500/20 text-primary-400 rounded">
                        4242 4242 4242 4242
                    </code>
                    {' '}with any future expiry date and any 3-digit CVC.
                </p>
            </div>
        </div>
    );
};

export default PaymentPage;
