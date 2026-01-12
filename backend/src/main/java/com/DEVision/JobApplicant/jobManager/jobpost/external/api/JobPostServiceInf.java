package com.DEVision.JobApplicant.jobManager.jobpost.external.api;

import java.util.List;
import java.util.Map;

import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostDto;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostListResponse;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostSearchRequest;

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
    
    /**
     * Delete a job post from JM system (Admin operation)
     * Requirement 6.2.2: Administrators shall be able to delete any Job Post
     * @param jobPostId The ID of the job post to delete
     * @param authorizationHeader User's JWT token to forward to JM API
     * @return true if deletion was successful, false otherwise
     */
    boolean deleteJobPost(String jobPostId, String authorizationHeader);
}

