package com.DEVision.JobApplicant.subscription.dto;

import java.math.BigDecimal;

// Payment request to JM system (can be changed based on JM API)
public record PaymentRequest(
        String userId,
        BigDecimal amount,
        String currency
) {
}

