package com.DEVision.JobApplicant.search_profile.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.DEVision.JobApplicant.search_profile.EmploymentType;

public record SearchProfileDto(
        String id,
        String userId,
        String profileName,
        List<String> desiredSkills,
        List<EmploymentType> employmentTypes,
        List<String> jobTitles,
        String desiredCountry,
        BigDecimal minSalary,
        BigDecimal maxSalary,
        Instant createdAt
) {
}

