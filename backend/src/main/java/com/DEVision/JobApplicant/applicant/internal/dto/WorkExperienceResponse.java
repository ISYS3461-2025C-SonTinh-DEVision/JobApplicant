package com.DEVision.JobApplicant.applicant.internal.dto;

import java.time.LocalDate;

/**
 * Response DTO for work experience entry
 */
public class WorkExperienceResponse {

    private String id;
    private String company;
    private String position;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean current;

    public WorkExperienceResponse() {}

    public WorkExperienceResponse(String id, String company, String position, String description,
                                 LocalDate startDate, LocalDate endDate, boolean current) {
        this.id = id;
        this.company = company;
        this.position = position;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.current = current;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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
