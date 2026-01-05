package com.DEVision.JobApplicant.jmintegration.jobpost.external.api;

import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostDto;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostListResponse;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostSearchRequest;

import java.util.List;
import java.util.Map;

/**
 * Interface for Job Post Service
 * Defines the contract for interacting with JM system's Job Post API
 */
public interface JobPostServiceInf {
    
    /**
     * Get job post detail by ID from JM system
     * @param jobPostId The ID of the job post
     * @return JobPostDto if found, null otherwise
     */
    JobPostDto getJobPostById(String jobPostId);
    
    /**
     * Get all job posts from JM system
     * @return List of JobPostDto
     */
    List<JobPostDto> getAllJobPosts();
    
    /**
     * Get all job posts with pagination and filtering support
     * @param searchRequest Search/filter request with query parameters
     * @return JobPostListResponse with paginated results
     */
    JobPostListResponse searchJobPosts(JobPostSearchRequest searchRequest);
    
    /**
     * Get all job posts with custom query parameters
     * @param queryParams Map of query parameter names to values
     * @return JobPostListResponse with paginated results
     */
    JobPostListResponse searchJobPosts(Map<String, Object> queryParams);
}

