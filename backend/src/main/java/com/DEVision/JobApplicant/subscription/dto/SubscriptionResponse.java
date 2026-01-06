package com.DEVision.JobApplicant.subscription.dto;

import com.DEVision.JobApplicant.subscription.entity.Subscription;

public record SubscriptionResponse(
        Subscription subscription,
        String paymentUrl
) {
}

