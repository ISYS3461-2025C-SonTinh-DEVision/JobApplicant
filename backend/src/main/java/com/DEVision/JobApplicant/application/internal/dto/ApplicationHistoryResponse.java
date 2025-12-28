package com.DEVision.JobApplicant.application.internal.dto;

import com.DEVision.JobApplicant.application.external.dto.ApplicationResponse;
import com.DEVision.JobApplicant.application.entity.Application;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for application history
 * Includes applications list and statistics
 */
public class ApplicationHistoryResponse {
    
    private List<ApplicationResponse> applications;
    private ApplicationHistoryStatistics statistics;
    
    public ApplicationHistoryResponse() {}
    
    public ApplicationHistoryResponse(List<ApplicationResponse> applications, ApplicationHistoryStatistics statistics) {
        this.applications = applications;
        this.statistics = statistics;
    }
    
    // Getters and Setters
    public List<ApplicationResponse> getApplications() {
        return applications;
    }
    
    public void setApplications(List<ApplicationResponse> applications) {
        this.applications = applications;
    }
    
    public ApplicationHistoryStatistics getStatistics() {
        return statistics;
    }
    
    public void setStatistics(ApplicationHistoryStatistics statistics) {
        this.statistics = statistics;
    }
    
    /**
     * Statistics about application history
     */
    public static class ApplicationHistoryStatistics {
        private long totalApplications;
        private long pendingCount;
        private long reviewingCount;
        private long acceptedCount;
        private long rejectedCount;
        private long withdrawnCount;
        private Map<Application.ApplicationStatus, Long> statusCounts;
        
        public ApplicationHistoryStatistics() {}
        
        public ApplicationHistoryStatistics(long totalApplications, long pendingCount, 
                                           long reviewingCount, long acceptedCount, 
                                           long rejectedCount, long withdrawnCount) {
            this.totalApplications = totalApplications;
            this.pendingCount = pendingCount;
            this.reviewingCount = reviewingCount;
            this.acceptedCount = acceptedCount;
            this.rejectedCount = rejectedCount;
            this.withdrawnCount = withdrawnCount;
        }
        
        // Getters and Setters
        public long getTotalApplications() {
            return totalApplications;
        }
        
        public void setTotalApplications(long totalApplications) {
            this.totalApplications = totalApplications;
        }
        
        public long getPendingCount() {
            return pendingCount;
        }
        
        public void setPendingCount(long pendingCount) {
            this.pendingCount = pendingCount;
        }
        
        public long getReviewingCount() {
            return reviewingCount;
        }
        
        public void setReviewingCount(long reviewingCount) {
            this.reviewingCount = reviewingCount;
        }
        
        public long getAcceptedCount() {
            return acceptedCount;
        }
        
        public void setAcceptedCount(long acceptedCount) {
            this.acceptedCount = acceptedCount;
        }
        
        public long getRejectedCount() {
            return rejectedCount;
        }
        
        public void setRejectedCount(long rejectedCount) {
            this.rejectedCount = rejectedCount;
        }
        
        public long getWithdrawnCount() {
            return withdrawnCount;
        }
        
        public void setWithdrawnCount(long withdrawnCount) {
            this.withdrawnCount = withdrawnCount;
        }
        
        public Map<Application.ApplicationStatus, Long> getStatusCounts() {
            return statusCounts;
        }
        
        public void setStatusCounts(Map<Application.ApplicationStatus, Long> statusCounts) {
            this.statusCounts = statusCounts;
        }
    }
}




