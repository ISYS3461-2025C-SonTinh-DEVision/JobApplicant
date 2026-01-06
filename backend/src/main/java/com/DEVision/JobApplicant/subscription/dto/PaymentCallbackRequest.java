package com.DEVision.JobApplicant.subscription.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentCallbackRequest(
        @NotBlank(message = "transactionId is required")
        String transactionId,

        @NotBlank(message = "status is required")
        String status, // Based on JM system status values

        @NotNull(message = "occurredAt is required")
        Instant occurredAt
) {
}

