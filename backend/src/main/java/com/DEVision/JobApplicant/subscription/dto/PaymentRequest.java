package com.DEVision.JobApplicant.subscription.dto;

import java.math.BigDecimal;

// Payment request to JM system
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

