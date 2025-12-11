package com.DEVision.JobApplicant.applicant.entity;

import jakarta.validation.constraints.NotBlank;
import org.bson.types.ObjectId;

import java.time.LocalDate;

/**
 * Embedded document for work experience entries in applicant profile
 */
public class WorkExperience {

    private ObjectId id;

    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Position/title is required")
    private String position;

    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean current; // Currently working at this company

    public WorkExperience() {
        this.id = new ObjectId();
    }

    public WorkExperience(String company, String position, String description,
                         LocalDate startDate, LocalDate endDate, boolean current) {
        this.id = new ObjectId();
        this.company = company;
        this.position = position;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.current = current;
    }

    // Getters and Setters
    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
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
