package com.DEVision.JobApplicant.subscription.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.DEVision.JobApplicant.subscription.enums.PaymentProvider;
import com.DEVision.JobApplicant.subscription.enums.TransactionStatus;

public record PaymentTransactionDto(
        String id,
        String userId,
        String userEmail,
        BigDecimal amount,
        String currency,
        TransactionStatus status,
        PaymentProvider paymentProvider,
        String externalTransactionId,
        Instant transactionTime,
        Instant createdAt
) {
}

