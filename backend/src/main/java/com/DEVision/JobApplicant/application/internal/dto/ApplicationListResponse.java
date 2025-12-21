package com.DEVision.JobApplicant.application.internal.dto;

import com.DEVision.JobApplicant.application.external.dto.ApplicationResponse;

import java.util.List;

// Internal DTO for returning list of applications with metadata
public class ApplicationListResponse {
    
    private List<ApplicationResponse> applications;
    private long totalCount;
    
    public ApplicationListResponse() {}
    
    public ApplicationListResponse(List<ApplicationResponse> applications, long totalCount) {
        this.applications = applications;
        this.totalCount = totalCount;
    }
    
    public List<ApplicationResponse> getApplications() {
        return applications;
    }
    
    public void setApplications(List<ApplicationResponse> applications) {
        this.applications = applications;
    }
    
    public long getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }
}

