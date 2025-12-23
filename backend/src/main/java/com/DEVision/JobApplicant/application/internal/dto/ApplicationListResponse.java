package com.DEVision.JobApplicant.application.internal.dto;

import com.DEVision.JobApplicant.application.external.dto.ApplicationResponse;

import java.util.List;

// Internal DTO for returning list of applications with pagination metadata
public class ApplicationListResponse {
    
    private List<ApplicationResponse> applications;
    private long totalCount;
    private int page;
    private int size;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
    
    public ApplicationListResponse() {}
    
    // Constructor for non-paginated response (backward compatibility)
    public ApplicationListResponse(List<ApplicationResponse> applications, long totalCount) {
        this.applications = applications;
        this.totalCount = totalCount;
        this.page = 0;
        this.size = (int) totalCount;
        this.totalPages = 1;
        this.hasNext = false;
        this.hasPrevious = false;
    }
    
    // Constructor for paginated response
    public ApplicationListResponse(List<ApplicationResponse> applications, long totalCount, 
                                   int page, int size, int totalPages) {
        this.applications = applications;
        this.totalCount = totalCount;
        this.page = page;
        this.size = size;
        this.totalPages = totalPages;
        this.hasNext = page < totalPages - 1;
        this.hasPrevious = page > 0;
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
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
    
    public int getTotalPages() {
        return totalPages;
    }
    
    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
    
    public boolean isHasNext() {
        return hasNext;
    }
    
    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }
    
    public boolean isHasPrevious() {
        return hasPrevious;
    }
    
    public void setHasPrevious(boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }
}

