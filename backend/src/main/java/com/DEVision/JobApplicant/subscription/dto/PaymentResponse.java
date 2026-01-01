package com.DEVision.JobApplicant.subscription.dto;

// Payment response from JM system (can be changed based on JM API)
public record PaymentResponse(
        boolean success,
        String externalTransactionId,
        String currency
) {
}

