package com.DEVision.JobApplicant.application.internal.dto;

import jakarta.validation.constraints.NotBlank;

// DTO for creating application from frontend/internal API
public class CreateApplicationRequest {
    
    @NotBlank(message = "Job post ID is required")
    private String jobPostId;
    
    private String jobTitle; // Optional: cached job post data
    private String companyName; // Optional: cached job post data
    
    public CreateApplicationRequest() {}
    
    public CreateApplicationRequest(String jobPostId) {
        this.jobPostId = jobPostId;
    }
    
    // Getters and Setters
    public String getJobPostId() {
        return jobPostId;
    }
    
    public void setJobPostId(String jobPostId) {
        this.jobPostId = jobPostId;
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


