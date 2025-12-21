package com.DEVision.JobApplicant.application.external.dto;

import jakarta.validation.constraints.NotBlank;

// DTO for external services to create applications
public class ApplicationRequest {
    
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
    
    private String jobTitle; // Optional: cached job post data
    private String companyName; // Optional: cached job post data
    
    public ApplicationRequest() {}
    
    public ApplicationRequest(String jobPostId, String applicantId, String cvUrl, String cvPublicId) {
        this.jobPostId = jobPostId;
        this.applicantId = applicantId;
        this.cvUrl = cvUrl;
        this.cvPublicId = cvPublicId;
    }
    
    // Getters and Setters
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
}

