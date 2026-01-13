package com.DEVision.JobApplicant.searchProfile.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO for job post events received from Kafka
 * Matches the structure of job posts from Job Manager system
 * 
 * JM sends events in this format:
 * {
 *   "eventType": "JOB_POST_CREATED",
 *   "eventId": "...",
 *   "timestamp": "...",
 *   "data": {
 *     "uniqueId": "job_xxx",
 *     "title": "...",
 *     "description": "...",
 *     "requiredSkills": [...],
 *     "salaryInfo": {...},
 *     "status": "active" | "inactive",
 *     ...
 *   }
 * }
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobPostEvent {

    // Event wrapper fields (from JM Kafka events)
    private String eventType;
    private String eventId;
    private String timestamp;
    private JobPostData data;

    // Direct fields for backwards compatibility (when consuming flat events)
    private String id;
    private String title;
    private String description;
    private List<String> employmentType;
    private SalaryInfo salary;
    private String location;
    private String status;
    private Instant postedDate;
    private Instant expiryDate;
    private List<String> skills;
    private Integer applicationCount;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean isFresherFriendly;

    /**
     * Nested class for the 'data' field in JM Kafka events
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JobPostData {
        private String jobPostId;
        private String uniqueId;
        private String companyId;
        private String title;
        private String description;
        private String location;
        
        @JsonAlias({"employmentType", "employmentTypes"})
        private List<String> employmentType;
        
        @JsonAlias({"salaryInfo", "salary"})
        private SalaryInfo salaryInfo;
        
        @JsonAlias({"requiredSkills", "skills"})
        private List<String> requiredSkills;
        
        @JsonAlias({"postedAt", "postedDate"})
        private Instant postedAt;
        
        @JsonAlias({"expiresAt", "expiryDate"})
        private Instant expiresAt;
        
        private String status;
        private Boolean isFresherFriendly;

        public JobPostData() {}

        public String getJobPostId() { return jobPostId; }
        public void setJobPostId(String jobPostId) { this.jobPostId = jobPostId; }

        public String getUniqueId() { return uniqueId; }
        public void setUniqueId(String uniqueId) { this.uniqueId = uniqueId; }

        public String getCompanyId() { return companyId; }
        public void setCompanyId(String companyId) { this.companyId = companyId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public List<String> getEmploymentType() { return employmentType; }
        public void setEmploymentType(List<String> employmentType) { this.employmentType = employmentType; }

        public SalaryInfo getSalaryInfo() { return salaryInfo; }
        public void setSalaryInfo(SalaryInfo salaryInfo) { this.salaryInfo = salaryInfo; }

        public List<String> getRequiredSkills() { return requiredSkills; }
        public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

        public Instant getPostedAt() { return postedAt; }
        public void setPostedAt(Instant postedAt) { this.postedAt = postedAt; }

        public Instant getExpiresAt() { return expiresAt; }
        public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Boolean getIsFresherFriendly() { return isFresherFriendly; }
        public void setIsFresherFriendly(Boolean isFresherFriendly) { this.isFresherFriendly = isFresherFriendly; }
    }

    // Nested class for salary information
    // Types: RANGE (has min/max/currency), ESTIMATION (has text), NEGOTIABLE (type only)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SalaryInfo {
        private List<String> type; // ["RANGE"], ["ESTIMATION"], or ["NEGOTIABLE"]
        private BigDecimal min;    // Only for RANGE
        private BigDecimal max;    // Only for RANGE
        private String currency;   // Only for RANGE
        private String text;       // Only for ESTIMATION

        public SalaryInfo() {}

        public List<String> getType() { return type; }
        public void setType(List<String> type) { this.type = type; }

        public BigDecimal getMin() { return min; }
        public void setMin(BigDecimal min) { this.min = min; }

        public BigDecimal getMax() { return max; }
        public void setMax(BigDecimal max) { this.max = max; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public JobPostEvent() {}

    // ===== Smart Getters that handle both wrapped and flat event formats =====

    /**
     * Get the job ID - use uniqueId (consistent with REST API JobPostDto)
     */
    public String getId() {
        if (data != null && data.getUniqueId() != null) {
            return data.getUniqueId();
        }
        return id;
    }
    
    /**
     * Get the MongoDB ObjectId from JM (different from uniqueId)
     */
    public String getJobPostId() {
        if (data != null) {
            return data.getJobPostId();
        }
        return null;
    }

    /**
     * Get job title - from wrapped data.title or flat title field
     */
    public String getTitle() {
        if (data != null && data.getTitle() != null) {
            return data.getTitle();
        }
        return title;
    }

    /**
     * Get job description - from wrapped data.description or flat description field
     */
    public String getDescription() {
        if (data != null && data.getDescription() != null) {
            return data.getDescription();
        }
        return description;
    }

    /**
     * Get employment types - from wrapped data.employmentType or flat employmentType field
     */
    public List<String> getEmploymentType() {
        if (data != null && data.getEmploymentType() != null) {
            return data.getEmploymentType();
        }
        return employmentType;
    }

    /**
     * Get salary info - from wrapped data.salaryInfo or flat salary field
     */
    public SalaryInfo getSalary() {
        if (data != null && data.getSalaryInfo() != null) {
            return data.getSalaryInfo();
        }
        return salary;
    }

    /**
     * Get location - from wrapped data.location or flat location field
     */
    public String getLocation() {
        if (data != null && data.getLocation() != null) {
            return data.getLocation();
        }
        return location;
    }

    /**
     * Get status - normalize "active" to "published" for matching algorithm
     */
    public String getStatus() {
        String rawStatus = null;
        if (data != null && data.getStatus() != null) {
            rawStatus = data.getStatus();
        } else {
            rawStatus = status;
        }
        // Normalize JM's "active" status to "published" for matching
        if ("active".equalsIgnoreCase(rawStatus)) {
            return "published";
        }
        return rawStatus;
    }

    /**
     * Get posted date - from wrapped data.postedAt or flat postedDate field
     */
    public Instant getPostedDate() {
        if (data != null && data.getPostedAt() != null) {
            return data.getPostedAt();
        }
        return postedDate;
    }

    /**
     * Get expiry date - from wrapped data.expiresAt or flat expiryDate field
     */
    public Instant getExpiryDate() {
        if (data != null && data.getExpiresAt() != null) {
            return data.getExpiresAt();
        }
        return expiryDate;
    }

    /**
     * Get required skills - from wrapped data.requiredSkills or flat skills field
     */
    public List<String> getSkills() {
        if (data != null && data.getRequiredSkills() != null) {
            return data.getRequiredSkills();
        }
        return skills;
    }

    /**
     * Check if job is fresher friendly
     */
    public Boolean getIsFresherFriendly() {
        if (data != null && data.getIsFresherFriendly() != null) {
            return data.getIsFresherFriendly();
        }
        return isFresherFriendly;
    }

    // ===== Event wrapper field getters =====

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public JobPostData getData() { return data; }
    public void setData(JobPostData data) { this.data = data; }

    // ===== Flat field setters for backwards compatibility =====

    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setEmploymentType(List<String> employmentType) { this.employmentType = employmentType; }
    public void setSalary(SalaryInfo salary) { this.salary = salary; }
    public void setLocation(String location) { this.location = location; }
    public void setStatus(String status) { this.status = status; }
    public void setPostedDate(Instant postedDate) { this.postedDate = postedDate; }
    public void setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public void setIsFresherFriendly(Boolean isFresherFriendly) { this.isFresherFriendly = isFresherFriendly; }

    public Integer getApplicationCount() { return applicationCount; }
    public void setApplicationCount(Integer applicationCount) { this.applicationCount = applicationCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "JobPostEvent{" +
                "eventType='" + eventType + '\'' +
                ", id='" + getId() + '\'' +
                ", title='" + getTitle() + '\'' +
                ", status='" + getStatus() + '\'' +
                ", skills=" + getSkills() +
                '}';
    }
}
