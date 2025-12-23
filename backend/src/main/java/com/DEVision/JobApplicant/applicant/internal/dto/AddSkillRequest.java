package com.DEVision.JobApplicant.applicant.internal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Internal DTO for adding a single skill to applicant profile
 */
public class AddSkillRequest {

    @NotBlank(message = "Skill name is required")
    @Size(max = 100, message = "Skill name cannot exceed 100 characters")
    private String skill;

    public AddSkillRequest() {}

    public AddSkillRequest(String skill) {
        this.skill = skill;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }
}
