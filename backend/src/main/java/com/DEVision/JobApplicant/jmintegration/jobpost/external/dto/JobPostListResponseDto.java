package com.DEVision.JobApplicant.jmintegration.jobpost.external.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

/**
 * Simplified DTO for frontend response
 * Transforms the JM API response into a cleaner structure
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobPostListResponseDto implements Serializable {
    
    private List<JobPostDto> jobs;
    
    @JsonProperty("totalCount")
    private Integer totalCount;
    
    private Integer page;
    
    @JsonProperty("totalPages")
    private Integer totalPages;
    
    public JobPostListResponseDto() {
    }
    
    public JobPostListResponseDto(List<JobPostDto> jobs, Integer totalCount, Integer page, Integer totalPages) {
        this.jobs = jobs;
        this.totalCount = totalCount;
        this.page = page;
        this.totalPages = totalPages;
    }
    
    // Factory method to create from JM API response
    public static JobPostListResponseDto from(JobPostListResponse response) {
        if (response == null) {
            return new JobPostListResponseDto(null, null, null, null);
        }
        return new JobPostListResponseDto(
            response.getJobs(),
            response.getTotalCount(),
            response.getPage(),
            response.getTotalPages()
        );
    }
    
    // Getters and Setters
    public List<JobPostDto> getJobs() {
        return jobs;
    }
    
    public void setJobs(List<JobPostDto> jobs) {
        this.jobs = jobs;
    }
    
    public Integer getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }
    
    public Integer getPage() {
        return page;
    }
    
    public void setPage(Integer page) {
        this.page = page;
    }
    
    public Integer getTotalPages() {
        return totalPages;
    }
    
    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }
}

