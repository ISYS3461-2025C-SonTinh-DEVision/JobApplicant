package com.DEVision.JobApplicant.subscription.dto;

import com.DEVision.JobApplicant.subscription.enums.PlanType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Subscription request from FE
public record SubscriptionRequest(
        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid email address")
        String email,

        @NotNull(message = "planType is required")
        PlanType planType
) {
}

