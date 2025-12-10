package com.DEVision.JobApplicant.subscription.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateSkillRequest(
        @NotBlank(message = "Skill name is required")
        String name,
        @NotBlank(message = "Skill category is required")
        String category
) {
}

