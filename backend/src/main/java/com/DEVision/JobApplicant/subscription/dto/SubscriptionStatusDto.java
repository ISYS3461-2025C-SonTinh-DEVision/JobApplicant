package com.DEVision.JobApplicant.subscription.dto;

import java.util.List;

/**
 * DTO for subscription status response.
 * Matches frontend expected format for SubscriptionPage.jsx
 */
public record SubscriptionStatusDto(
    boolean isPremium,
    String plan,
    Double price,
    String currency,
    String status,
    String startDate,
    String renewalDate,
    List<String> features
) {
    /**
     * Default FREEMIUM subscription status
     */
    public static SubscriptionStatusDto freemiumDefault() {
        return new SubscriptionStatusDto(
            false,
            "FREEMIUM",
            0.0,
            "USD",
            "inactive",
            null,
            null,
            List.of()
        );
    }

    /**
     * Create Premium subscription status from subscription data
     */
    public static SubscriptionStatusDto fromPremium(
            String status,
            String startDate,
            String renewalDate
    ) {
        return new SubscriptionStatusDto(
            true,
            "PREMIUM",
            10.00,
            "USD",
            status,
            startDate,
            renewalDate,
            List.of(
                "Real-time job alerts",
                "Priority application status",
                "Advanced job matching",
                "Unlimited job applications",
                "Custom search profiles"
            )
        );
    }
}
