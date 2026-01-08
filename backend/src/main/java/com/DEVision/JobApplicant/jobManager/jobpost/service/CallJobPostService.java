package com.DEVision.JobApplicant.jobManager.jobpost.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.DEVision.JobApplicant.jobManager.config.ExternalUrl;
import com.DEVision.JobApplicant.jobManager.jobpost.external.api.JobPostServiceInf;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostDto;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostListResponse;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostSearchRequest;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostSingleResponse;

import java.util.List;
import java.util.Map;

/**
 * Service for calling JM system Job Post API
 * Implements the interface and uses RestTemplate to make HTTP calls
 * Supports all query parameters for filtering, searching, and pagination
 * 
 * Uses Cognito OAuth2 token for system-to-system authentication
 */
@Service
public class CallJobPostService implements JobPostServiceInf {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ExternalUrl externalUrl;
    
    @Autowired
    private CognitoTokenService cognitoTokenService;
    
    /**
     * Create HTTP headers with Cognito Bearer token for system-to-system auth
     */
    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", cognitoTokenService.getAuthorizationHeader());
        return headers;
    }
    
    @Override
    public JobPostDto getJobPostById(String jobPostId) {
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
        
        ResponseEntity<JobPostSingleResponse> response = restTemplate.exchange(
            externalUrl.getJobPostsUrl() + "/{jobPostId}",
            HttpMethod.GET,
            entity,
            JobPostSingleResponse.class,
            jobPostId
        );
        return response.getBody() != null ? response.getBody().getJobPost() : null;
    }
    
    @Override
    public List<JobPostDto> getAllJobPosts() {
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
        
        ResponseEntity<JobPostListResponse> response = restTemplate.exchange(
            externalUrl.getJobPostsUrl(),
            HttpMethod.GET,
            entity,
            JobPostListResponse.class
        );
        return response.getBody() != null && response.getBody().getJobs() != null 
            ? response.getBody().getJobs() 
            : List.of();
    }
    
    @Override
    public JobPostListResponse searchJobPosts(JobPostSearchRequest searchRequest) {
        String url = buildUrlWithQueryParams(externalUrl.getJobPostsUrl(), searchRequest.toQueryParams());
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
        
        ResponseEntity<JobPostListResponse> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            JobPostListResponse.class
        );
        return response.getBody();
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
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
        
        ResponseEntity<JobPostListResponse> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            JobPostListResponse.class
        );
        return response.getBody();
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

