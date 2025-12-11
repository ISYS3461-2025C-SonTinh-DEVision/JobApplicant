package com.DEVision.JobApplicant.search_profile.dto;

import java.time.Instant;

public record SkillDto(
        String id,
        String name,
        String category,
        Instant createdAt
) {
}

