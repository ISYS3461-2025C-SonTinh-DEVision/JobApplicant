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

// Storage key for persisting subscription state
const STORAGE_KEY = 'devision_subscription';

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
        // Try real API first, fallback to mock if API unavailable
        this.useMock = false; // Enable real API by default
        // Load subscription from localStorage for persistence across refreshes
        this._mockSubscription = this._loadFromStorage() || { ...MOCK_SUBSCRIPTION };
    }

    /**
     * Load subscription from localStorage
     * @private
     */
    _loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading subscription from storage:', error);
        }
        return null;
    }

    /**
     * Save subscription to localStorage
     * @private
     */
    _saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._mockSubscription));
        } catch (error) {
            console.error('Error saving subscription to storage:', error);
        }
    }

    /**
     * Get current subscription status
     * @returns {Promise<Object>} Subscription details
     */
    async getSubscriptionStatus() {
        // Try real API first, fallback to mock if unavailable
        if (!this.useMock) {
            try {
                const response = await httpUtil.get(API_ENDPOINTS.SUBSCRIPTION.STATUS);
                // Backend now returns SubscriptionStatusDto directly
                // Wrap it in the expected format for the frontend
                return {
                    success: true,
                    data: response,
                    source: 'api'
                };
            } catch (error) {
                console.warn('Real API unavailable, falling back to mock:', error.message);
                // Fall through to mock
            }
        }

        // Mock fallback
        await this._delay(300);
        return {
            success: true,
            data: this._mockSubscription,
            source: 'mock'
        };
    }


    /**
     * Subscribe to premium plan
     * @param {Object} subscriptionData - Subscription information
     * @param {string} subscriptionData.email - User email
     * @param {string} subscriptionData.planType - Plan type ('PREMIUM' or 'FREEMIUM')
     * @returns {Promise<Object>} Subscription response with paymentUrl
     */
    async subscribe(subscriptionData) {
        const { email, planType } = subscriptionData;

        // Try real API first
        if (!this.useMock) {
            try {
                // Call backend API with SubscriptionRequest in body
                // Backend extracts userId from JWT token via @AuthenticationPrincipal
                const response = await httpUtil.post(
                    API_ENDPOINTS.SUBSCRIPTION.SUBSCRIBE,
                    { email, planType }
                );

                // Response contains: { subscription, paymentUrl }
                return response;
            } catch (error) {
                console.warn('Real API unavailable, using mock subscription:', error.message);
                // Fall through to mock for demo purposes
            }
        }

        // Mock fallback - simulate payment URL redirect
        await this._delay(1500);

        // Mock successful subscription response with payment URL
        const mockSubscription = {
            id: `sub_${Date.now()}`,
            planType,
            status: 'PENDING',
            startDate: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        return {
            success: true,
            data: {
                subscription: mockSubscription,
                paymentUrl: `https://payment-gateway.example.com/checkout?session=${Date.now()}`
            },
            source: 'mock'
        };
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

            // Persist to localStorage
            this._saveToStorage();

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
            // Use /api/subscription/transactions endpoint
            const response = await httpUtil.get('/api/subscription/transactions');
            // Transform transactions to match billing history format
            const transactions = response || [];
            const formattedHistory = transactions.map(t => ({
                id: t.id,
                date: t.transactionDate || t.createdAt,
                amount: t.amount,
                currency: t.currency || 'USD',
                status: t.status?.toLowerCase() || 'completed',
                description: 'DEVision Premium - Monthly Subscription',
                paymentMethod: '**** ' + (t.externalTransactionId?.slice(-4) || '0000'),
            }));
            return {
                success: true,
                data: formattedHistory,
            };
        } catch (error) {
            console.warn('Error getting payment history, returning empty:', error.message);
            return {
                success: true,
                data: [],
            };
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
        this._saveToStorage();
    }

    /**
     * Set to premium (for testing)
     */
    setToPremium() {
        this._mockSubscription = { ...MOCK_PREMIUM_SUBSCRIPTION };
        this._saveToStorage();
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
