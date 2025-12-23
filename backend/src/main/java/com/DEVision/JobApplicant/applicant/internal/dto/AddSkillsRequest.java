package com.DEVision.JobApplicant.applicant.internal.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Internal DTO for adding multiple skills to applicant profile
 */
public class AddSkillsRequest {

    @NotEmpty(message = "At least one skill is required")
    @Size(max = 50, message = "Cannot add more than 50 skills at once")
    private List<String> skills;

    public AddSkillsRequest() {}

    public AddSkillsRequest(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}
