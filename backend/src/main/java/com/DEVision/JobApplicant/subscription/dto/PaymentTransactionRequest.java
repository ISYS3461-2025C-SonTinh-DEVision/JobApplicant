package com.DEVision.JobApplicant.subscription.dto;

import java.math.BigDecimal;

import com.DEVision.JobApplicant.subscription.enums.TransactionStatus;

public record PaymentTransactionRequest(
        String userId,
        BigDecimal amount,
        String currency,
        TransactionStatus status,
        String externalTransactionId
) {
}

