/**
 * Subscription Service
 * 
 * Handles premium subscription management for Job Applicants.
 * Implements Requirements 5.x for subscription features.
 * 
 * Features:
 * - Get subscription status
 * - Subscribe to premium (with 3rd party payment)
 * - Cancel subscription
 * - Get payment history
 * 
 * Architecture: A.2.c - REST HTTP Helper Class pattern
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

// Mock subscription data
const MOCK_SUBSCRIPTION = {
    isPremium: false,
    plan: null,
    price: null,
    startDate: null,
    renewalDate: null,
    status: 'inactive',
};

const MOCK_PREMIUM_SUBSCRIPTION = {
    isPremium: true,
    plan: 'Monthly',
    price: 10,
    currency: 'USD',
    startDate: '2024-12-01T00:00:00Z',
    renewalDate: '2025-01-01T00:00:00Z',
    status: 'active',
    features: [
        'Real-time job alerts',
        'Priority application status',
        'Advanced job matching',
        'Unlimited job applications',
        'Custom search profiles',
    ],
};

const MOCK_PAYMENT_HISTORY = [
    {
        id: 'pay_001',
        date: '2024-12-01T10:30:00Z',
        amount: 10.00,
        currency: 'USD',
        status: 'completed',
        description: 'DEVision Premium - Monthly Subscription',
        paymentMethod: '**** 4242',
    },
    {
        id: 'pay_002',
        date: '2024-11-01T10:30:00Z',
        amount: 10.00,
        currency: 'USD',
        status: 'completed',
        description: 'DEVision Premium - Monthly Subscription',
        paymentMethod: '**** 4242',
    },
    {
        id: 'pay_003',
        date: '2024-10-01T10:30:00Z',
        amount: 10.00,
        currency: 'USD',
        status: 'completed',
        description: 'DEVision Premium - Monthly Subscription',
        paymentMethod: '**** 4242',
    },
];

class SubscriptionService {
    constructor() {
        this.useMock = true; // Start with mock, toggle to false when backend is ready
        this._mockSubscription = { ...MOCK_SUBSCRIPTION };
    }

    /**
     * Get current subscription status
     * @returns {Promise<Object>} Subscription details
     */
    async getSubscriptionStatus() {
        if (this.useMock) {
            await this._delay(300);
            return {
                success: true,
                data: this._mockSubscription,
            };
        }

        try {
            return await httpUtil.get(API_ENDPOINTS.SUBSCRIPTION.STATUS);
        } catch (error) {
            console.error('Error getting subscription status:', error);
            throw error;
        }
    }

    /**
     * Subscribe to premium plan
     * @param {Object} paymentDetails - Payment information
     * @param {string} paymentDetails.plan - Plan type ('monthly')
     * @param {string} paymentDetails.paymentMethodId - Stripe payment method ID
     * @returns {Promise<Object>} Subscription result
     */
    async subscribe(paymentDetails) {
        if (this.useMock) {
            await this._delay(1500); // Simulate payment processing

            // Mock successful subscription
            this._mockSubscription = {
                ...MOCK_PREMIUM_SUBSCRIPTION,
                startDate: new Date().toISOString(),
                renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            };

            return {
                success: true,
                message: 'Subscription activated successfully!',
                data: this._mockSubscription,
                transaction: {
                    id: `pay_${Date.now()}`,
                    amount: 10.00,
                    currency: 'USD',
                    status: 'completed',
                },
            };
        }

        try {
            return await httpUtil.post(API_ENDPOINTS.SUBSCRIPTION.SUBSCRIBE, paymentDetails);
        } catch (error) {
            console.error('Error subscribing:', error);
            throw error;
        }
    }

    /**
     * Cancel subscription
     * @returns {Promise<Object>} Cancellation result
     */
    async cancelSubscription() {
        if (this.useMock) {
            await this._delay(500);

            // Set subscription to cancelled (will expire at renewal date)
            this._mockSubscription = {
                ...this._mockSubscription,
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
            };

            return {
                success: true,
                message: 'Subscription cancelled. You will retain access until the end of the billing period.',
                data: this._mockSubscription,
            };
        }

        try {
            return await httpUtil.post(API_ENDPOINTS.SUBSCRIPTION.CANCEL);
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    /**
     * Get payment history
     * @returns {Promise<Object>} Payment transactions
     */
    async getPaymentHistory() {
        if (this.useMock) {
            await this._delay(300);
            return {
                success: true,
                data: this._mockSubscription.isPremium ? MOCK_PAYMENT_HISTORY : [],
            };
        }

        try {
            return await httpUtil.get(`${API_ENDPOINTS.SUBSCRIPTION.STATUS}/history`);
        } catch (error) {
            console.error('Error getting payment history:', error);
            throw error;
        }
    }

    /**
     * Get subscription plans
     * @returns {Promise<Object>} Available plans
     */
    async getPlans() {
        await this._delay(200);
        return {
            success: true,
            data: [
                {
                    id: 'monthly',
                    name: 'Monthly Premium',
                    price: 10,
                    currency: 'USD',
                    interval: 'month',
                    features: [
                        'Real-time job alerts matching your criteria',
                        'Priority application visibility',
                        'Advanced job matching algorithm',
                        'Unlimited job applications',
                        'Custom search profiles (up to 5)',
                        'Application analytics',
                    ],
                    popular: true,
                },
                {
                    id: 'yearly',
                    name: 'Yearly Premium',
                    price: 96, // $8/month billed annually
                    currency: 'USD',
                    interval: 'year',
                    savings: '20%',
                    features: [
                        'All Monthly features',
                        'Priority customer support',
                        'Profile verification badge',
                        'Early access to new features',
                    ],
                    popular: false,
                },
            ],
        };
    }

    /**
     * Validate credit card (mock)
     * @param {Object} cardDetails - Card information
     * @returns {Object} Validation result
     */
    validateCard(cardDetails) {
        const { cardNumber, expiryMonth, expiryYear, cvc } = cardDetails;
        const errors = {};

        // Card number validation (Luhn algorithm simplified)
        if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
            errors.cardNumber = 'Invalid card number';
        }

        // Expiry validation
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (!expiryMonth || expiryMonth < 1 || expiryMonth > 12) {
            errors.expiryMonth = 'Invalid expiry month';
        }

        if (!expiryYear || expiryYear < currentYear ||
            (expiryYear === currentYear && expiryMonth < currentMonth)) {
            errors.expiryDate = 'Card has expired';
        }

        // CVC validation
        if (!cvc || cvc.length < 3 || cvc.length > 4) {
            errors.cvc = 'Invalid CVC';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Reset to free tier (for testing)
     */
    resetToFree() {
        this._mockSubscription = { ...MOCK_SUBSCRIPTION };
    }

    /**
     * Set to premium (for testing)
     */
    setToPremium() {
        this._mockSubscription = { ...MOCK_PREMIUM_SUBSCRIPTION };
    }

    /**
     * Helper to simulate network delay
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
const subscriptionService = new SubscriptionService();
export default subscriptionService;

// Export class for testing
export { SubscriptionService };
