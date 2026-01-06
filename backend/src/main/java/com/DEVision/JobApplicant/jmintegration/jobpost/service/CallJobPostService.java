package com.DEVision.JobApplicant.jmintegration.jobpost.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.DEVision.JobApplicant.jmintegration.jobpost.config.ExternalUrl;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.api.JobPostServiceInf;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostDto;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostListResponse;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostSearchRequest;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostSingleResponse;

import java.util.List;
import java.util.Map;

/**
 * Service for calling JM system Job Post API
 * Implements the interface and uses RestTemplate to make HTTP calls
 * Supports all query parameters for filtering, searching, and pagination
 */
@Service
public class CallJobPostService implements JobPostServiceInf {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ExternalUrl externalUrl;
    
    @Override
    public JobPostDto getJobPostById(String jobPostId) {
        JobPostSingleResponse response = restTemplate.getForObject(
            externalUrl.getJobPostsUrl() + "/{jobPostId}",
            JobPostSingleResponse.class,
            jobPostId
        );
        return response != null ? response.getJobPost() : null;
    }
    
    @Override
    public List<JobPostDto> getAllJobPosts() {
        JobPostListResponse response = restTemplate.getForObject(
            externalUrl.getJobPostsUrl(),
            JobPostListResponse.class
        );
        return response != null && response.getJobs() != null 
            ? response.getJobs() 
            : List.of();
    }
    
    @Override
    public JobPostListResponse searchJobPosts(JobPostSearchRequest searchRequest) {
        String url = buildUrlWithQueryParams(externalUrl.getJobPostsUrl(), searchRequest.toQueryParams());
        return restTemplate.getForObject(url, JobPostListResponse.class);
    }
    
    @Override
    public JobPostListResponse searchJobPosts(Map<String, Object> queryParams) {
        // Enforce minimum limit of 20 (JM API requirement)
        if (queryParams.containsKey("limit")) {
            Object limitObj = queryParams.get("limit");
            int limit = 20;
            if (limitObj instanceof Integer) {
                limit = Math.max((Integer) limitObj, 20);
            } else if (limitObj instanceof String) {
                try {
                    limit = Math.max(Integer.parseInt((String) limitObj), 20);
                } catch (NumberFormatException e) {
                    limit = 20;
                }
            }
            queryParams.put("limit", limit);
        } else {
            queryParams.put("limit", 20);
        }
        
        String url = buildUrlWithQueryParams(externalUrl.getJobPostsUrl(), queryParams);
        return restTemplate.getForObject(url, JobPostListResponse.class);
    }
    
    /**
     * Build URL with query parameters using UriComponentsBuilder
     * Handles List types properly for multiple query parameter values
     * @param baseUrl The base URL
     * @param queryParams Map of query parameter names to values
     * @return URL string with query parameters
     */
    private String buildUrlWithQueryParams(String baseUrl, Map<String, Object> queryParams) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(baseUrl);
        
        queryParams.forEach((key, value) -> {
            if (value != null) {
                // UriComponentsBuilder handles List types automatically
                // It will create multiple query params like ?employmentType=Full-time&employmentType=Part-time
                uriBuilder.queryParam(key, value);
            }
        });
        
        return uriBuilder.toUriString();
    }
}

