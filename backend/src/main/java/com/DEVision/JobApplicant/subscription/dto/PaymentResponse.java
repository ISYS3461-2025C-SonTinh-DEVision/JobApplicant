package com.DEVision.JobApplicant.subscription.dto;

import java.math.BigDecimal;

// Payment response from JM system
public record PaymentResponse(
        String transactionId,
        String status,
        String paymentUrl,
        BigDecimal amount,
        String currency
) {
    public boolean isSuccessful() {
        return status != null && !status.equalsIgnoreCase("failed");
    }
}

