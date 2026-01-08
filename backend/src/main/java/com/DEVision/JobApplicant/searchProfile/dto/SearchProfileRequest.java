package com.DEVision.JobApplicant.searchProfile.dto;

import java.math.BigDecimal;
import java.util.List;

import com.DEVision.JobApplicant.searchProfile.EmploymentType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record SearchProfileRequest(
        @NotBlank(message = "Profile name is required")
        String profileName,
        @NotEmpty(message = "At least one desired skill is required")
        List<@NotBlank(message = "Skill names cannot be blank") String> desiredSkills,
        @NotEmpty(message = "At least one employment type is required")
        List<@NotNull(message = "Employment type cannot be null") EmploymentType> employmentTypes,
        @NotEmpty(message = "At least one job title is required")
        List<@NotBlank(message = "Job title cannot be blank") String> jobTitles,
        @NotBlank(message = "Desired country is required")
        String desiredCountry,
        @NotNull(message = "Minimum salary is required")
        BigDecimal minSalary,
        BigDecimal maxSalary
) {
}

