package com.DEVision.JobApplicant.application.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Document(collection = "applications")
public class Application {
    
    @Id
    private String id;
    
    @NotBlank(message = "Job post ID is required")
    private String jobPostId;
    
    @NotBlank(message = "Applicant ID is required")
    private String applicantId;
    
    @NotBlank(message = "CV URL is required")
    private String cvUrl;
    
    @NotBlank(message = "CV public ID is required")
    private String cvPublicId;
    
    private String coverLetterUrl; // Optional
    private String coverLetterPublicId; // Optional
    
    @NotNull
    private ApplicationStatus status;
    
    @NotNull
    private LocalDateTime appliedAt;
    
    private LocalDateTime updatedAt;
    
    // Additional job post data cached from external system
    private String jobTitle;
    private String companyName;
    
    public Application() {
        this.appliedAt = LocalDateTime.now();
        this.status = ApplicationStatus.PENDING;
    }
    
    public Application(String jobPostId, String applicantId, String cvUrl, String cvPublicId) {
        this.jobPostId = jobPostId;
        this.applicantId = applicantId;
        this.cvUrl = cvUrl;
        this.cvPublicId = cvPublicId;
        this.appliedAt = LocalDateTime.now();
        this.status = ApplicationStatus.PENDING;
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

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
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
    
    public enum ApplicationStatus {
        PENDING,
        REVIEWING,
        ACCEPTED,
        REJECTED,
        WITHDRAWN
    }
}

