package com.DEVision.JobApplicant.subscription.dto;

import java.math.BigDecimal;

/**
 * Payment request to JM system via /api/payments/process endpoint.
 * Includes callbackUrl for JM to notify JA when payment completes.
 */
public record PaymentRequest(
        String email,
        BigDecimal amount,
        String currency,
        String paymentMethod,
        String subscriptionType,
        String successUrl,
        String cancelUrl,
        // JA Integration fields - added for callback support
        String callbackUrl,
        String externalSubscriptionId,
        String applicantId
) {
    /**
     * Constructor without callback fields (backwards compatibility)
     */
    public PaymentRequest(
            String email,
            BigDecimal amount,
            String currency,
            String paymentMethod,
            String subscriptionType,
            String successUrl,
            String cancelUrl) {
        this(email, amount, currency, paymentMethod, subscriptionType, successUrl, cancelUrl, null, null, null);
    }
}

