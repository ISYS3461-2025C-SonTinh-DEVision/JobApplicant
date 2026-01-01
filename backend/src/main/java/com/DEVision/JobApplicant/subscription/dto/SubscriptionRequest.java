package com.DEVision.JobApplicant.subscription.dto;

import com.DEVision.JobApplicant.subscription.enums.PlanType;

import jakarta.validation.constraints.NotNull;

// Subscription request from FE
public record SubscriptionRequest(
        @NotNull(message = "planType is required")
        PlanType planType
) {
}

