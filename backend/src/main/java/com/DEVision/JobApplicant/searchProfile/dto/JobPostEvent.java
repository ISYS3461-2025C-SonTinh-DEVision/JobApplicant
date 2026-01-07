package com.DEVision.JobApplicant.searchProfile.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * DTO for job post events received from Kafka
 * Matches the structure of job posts from Job Manager system
 */
public class JobPostEvent {

    private String id;
    private String title;
    private String description;
    private List<String> employmentType; // ["fulltime", "contract", etc.]
    private SalaryInfo salary;
    private String location;
    private String status; // "published", "draft", etc.
    private Instant postedDate;
    private Instant expiryDate;
    private List<String> skills;
    private Integer applicationCount;
    private Instant createdAt;
    private Instant updatedAt;

    // Nested class for salary information
    public static class SalaryInfo {
        private String type; // "range", "fixed", etc.
        private BigDecimal min;
        private BigDecimal max;
        private String currency;

        public SalaryInfo() {
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public BigDecimal getMin() {
            return min;
        }

        public void setMin(BigDecimal min) {
            this.min = min;
        }

        public BigDecimal getMax() {
            return max;
        }

        public void setMax(BigDecimal max) {
            this.max = max;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }
    }

    public JobPostEvent() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(List<String> employmentType) {
        this.employmentType = employmentType;
    }

    public SalaryInfo getSalary() {
        return salary;
    }

    public void setSalary(SalaryInfo salary) {
        this.salary = salary;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getPostedDate() {
        return postedDate;
    }

    public void setPostedDate(Instant postedDate) {
        this.postedDate = postedDate;
    }

    public Instant getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Instant expiryDate) {
        this.expiryDate = expiryDate;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public Integer getApplicationCount() {
        return applicationCount;
    }

    public void setApplicationCount(Integer applicationCount) {
        this.applicationCount = applicationCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
