package com.DEVision.JobApplicant.applicant.internal.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

/**
 * Request DTO for updating work experience entry
 */
public class UpdateWorkExperienceRequest {

    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Position is required")
    private String position;

    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean current;

    public UpdateWorkExperienceRequest() {}

    // Getters and Setters
    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public boolean isCurrent() {
        return current;
    }

    public void setCurrent(boolean current) {
        this.current = current;
    }
}
