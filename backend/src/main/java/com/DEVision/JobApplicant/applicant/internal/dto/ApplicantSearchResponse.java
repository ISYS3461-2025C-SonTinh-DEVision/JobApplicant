package com.DEVision.JobApplicant.applicant.internal.dto;

import java.util.List;

/**
 * DTO for paginated applicant search response
 */
public class ApplicantSearchResponse {

    private List<ProfileResponse> applicants;
    private int currentPage;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;

    public ApplicantSearchResponse() {}

    public ApplicantSearchResponse(List<ProfileResponse> applicants, int currentPage, int pageSize,
                                   long totalElements, int totalPages) {
        this.applicants = applicants;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.hasNext = currentPage < totalPages - 1;
        this.hasPrevious = currentPage > 0;
    }

    // Getters and Setters
    public List<ProfileResponse> getApplicants() {
        return applicants;
    }

    public void setApplicants(List<ProfileResponse> applicants) {
        this.applicants = applicants;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
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

