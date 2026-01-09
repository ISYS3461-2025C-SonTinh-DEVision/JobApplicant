package com.DEVision.JobApplicant.application.external.dto;

import com.DEVision.JobApplicant.application.entity.Application;

import java.time.LocalDateTime;

// DTO for returning application data to external services
public class ApplicationResponse {
    
    private String id;
    private String jobPostId;
    private String applicantId;
    private String cvUrl;
    private String cvPublicId;
    private String coverLetterUrl;
    private String coverLetterPublicId;
    private Application.ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private String jobTitle;
    private String companyName;
    private String location;
    private String employmentType;
    
    public ApplicationResponse() {}
    
    public ApplicationResponse(String id, String jobPostId, String applicantId, String cvUrl, 
                              String cvPublicId, String coverLetterUrl, String coverLetterPublicId,
                              Application.ApplicationStatus status, LocalDateTime appliedAt, 
                              LocalDateTime updatedAt, String jobTitle, String companyName,
                              String location, String employmentType) {
        this.id = id;
        this.jobPostId = jobPostId;
        this.applicantId = applicantId;
        this.cvUrl = cvUrl;
        this.cvPublicId = cvPublicId;
        this.coverLetterUrl = coverLetterUrl;
        this.coverLetterPublicId = coverLetterPublicId;
        this.status = status;
        this.appliedAt = appliedAt;
        this.updatedAt = updatedAt;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.location = location;
        this.employmentType = employmentType;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getJobPostId() {
        return jobPostId;
    }
    
    public void setJobPostId(String jobPostId) {
        this.jobPostId = jobPostId;
    }
    
    public String getApplicantId() {
        return applicantId;
    }
    
    public void setApplicantId(String applicantId) {
        this.applicantId = applicantId;
    }
    
    public String getCvUrl() {
        return cvUrl;
    }
    
    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }
    
    public String getCvPublicId() {
        return cvPublicId;
    }
    
    public void setCvPublicId(String cvPublicId) {
        this.cvPublicId = cvPublicId;
    }
    
    public String getCoverLetterUrl() {
        return coverLetterUrl;
    }
    
    public void setCoverLetterUrl(String coverLetterUrl) {
        this.coverLetterUrl = coverLetterUrl;
    }
    
    public String getCoverLetterPublicId() {
        return coverLetterPublicId;
    }
    
    public void setCoverLetterPublicId(String coverLetterPublicId) {
        this.coverLetterPublicId = coverLetterPublicId;
    }
    
    public Application.ApplicationStatus getStatus() {
        return status;
    }
    
    public void setStatus(Application.ApplicationStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }
    
    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getJobTitle() {
        return jobTitle;
    }
    
    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getEmploymentType() {
        return employmentType;
    }
    
    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }
}


