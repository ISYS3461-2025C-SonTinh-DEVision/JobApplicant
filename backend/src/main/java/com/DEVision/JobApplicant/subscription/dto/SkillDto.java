package com.DEVision.JobApplicant.subscription.dto;

import java.time.Instant;

public record SkillDto(
        String id,
        String name,
        String category,
        Instant createdAt
) {
}

