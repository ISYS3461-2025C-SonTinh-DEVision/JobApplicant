package com.DEVision.JobApplicant.subscription.dto;

import java.math.BigDecimal;

// Payment request to JM system
// Note: JM handles callback internally via Stripe webhooks
// callbackUrl is NOT accepted by JM API
public record PaymentRequest(
        String email,
        BigDecimal amount,
        String currency,
        String paymentMethod,
        String subscriptionType,
        String successUrl,
        String cancelUrl
) {
}
