package com.DEVision.JobApplicant.jobManager.jobpost.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.DEVision.JobApplicant.auth.service.CognitoTokenService;
import com.DEVision.JobApplicant.jobManager.config.ExternalUrl;
import com.DEVision.JobApplicant.jobManager.jobpost.external.api.JobPostServiceInf;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostDto;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostListResponse;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostSearchRequest;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostSingleResponse;
import com.DEVision.JobApplicant.jobManager.company.service.CallCompanyService;
import com.DEVision.JobApplicant.jobManager.company.external.dto.CompanyDto;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for calling JM system Job Post API
 * Implements the interface and uses RestTemplate to make HTTP calls
 * Supports all query parameters for filtering, searching, and pagination
 * 
 * Uses Cognito OAuth2 token for system-to-system authentication
 * Uses LocationMappingService for smart country-to-city filtering
 */
@Service
public class CallJobPostService implements JobPostServiceInf {
    
    private static final Logger logger = LoggerFactory.getLogger(CallJobPostService.class);
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ExternalUrl externalUrl;
    
    @Autowired
    private CognitoTokenService cognitoTokenService;
    
    @Autowired
    private LocationMappingService locationMappingService;
    
    @Autowired
    private CallCompanyService callCompanyService;
    
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
        
        JobPostDto jobPost = response.getBody() != null ? response.getBody().getJobPost() : null;
        
        if (jobPost != null) {
            logger.info("Fetched job '{}' ({}), companyId={}, companyName={}", 
                jobPost.getTitle(), jobPostId, jobPost.getCompanyId(), jobPost.getCompanyName());
            
            // Enrich with company name from Company API if missing or blank
            String existingCompanyName = jobPost.getCompanyName();
            boolean needsEnrichment = existingCompanyName == null || existingCompanyName.trim().isEmpty();
            
            if (needsEnrichment) {
                String companyId = jobPost.getCompanyId();
                if (companyId != null && !companyId.isEmpty()) {
                    try {
                        logger.info("Enriching job {} with company data from companyId: {}", jobPostId, companyId);
                        CompanyDto company = callCompanyService.getCompanyById(companyId);
                        if (company != null) {
                            jobPost.setCompanyName(company.getName());
                            // Also set logo URL if available
                            if ((jobPost.getCompanyLogo() == null || jobPost.getCompanyLogo().trim().isEmpty()) 
                                && company.getLogoUrl() != null) {
                                jobPost.setCompanyLogo(company.getLogoUrl());
                            }
                            logger.info("Enriched job {} with company: name={}, logo={}", 
                                jobPostId, company.getName(), company.getLogoUrl());
                        } else {
                            logger.warn("Company API returned null for companyId: {}", companyId);
                        }
                    } catch (Exception e) {
                        logger.warn("Could not fetch company info for job {} (companyId={}): {}", 
                            jobPostId, companyId, e.getMessage());
                    }
                } else {
                    logger.warn("Job {} has no companyId, cannot enrich company data", jobPostId);
                }
            }
        }
        
        return jobPost;
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
        // Check if location filter is a country name
        String locationFilter = searchRequest.getLocation();
        boolean isCountryFilter = locationMappingService.isCountry(locationFilter);
        
        // Check if multiple employment types are selected (JM API only supports single value)
        List<String> employmentTypes = searchRequest.getEmploymentType();
        boolean isMultiEmploymentTypeFilter = employmentTypes != null && employmentTypes.size() > 1;
        
        // Check if fresher filter is enabled
        Boolean fresherFriendly = searchRequest.getFresherFriendly();
        boolean isFresherFilter = fresherFriendly != null && fresherFriendly;
        
        // Full-Text Search (FTS) check
        String searchQuery = searchRequest.getSearch();
        boolean isFTSEnabled = searchQuery != null && !searchQuery.trim().isEmpty();
        
        // Build query params
        Map<String, Object> queryParams = searchRequest.toQueryParams();
        
        // If it's a country, remove location from query params (we'll filter after fetch)
        if (isCountryFilter) {
            queryParams.remove("location");
            logger.info("Smart location filtering: '{}' detected as country, will filter {} cities server-side", 
                locationFilter, locationMappingService.getLocationTermsForCountry(locationFilter).size());
        }
        
        // If multiple employment types, remove from query params (we'll filter after fetch)
        if (isMultiEmploymentTypeFilter) {
            queryParams.remove("employmentType");
            logger.info("Multi employment type filtering: {} types selected, will filter server-side", 
                employmentTypes.size());
        }
        
        // Map fresherFriendly to isFresherFriendly for JM API
        queryParams.remove("fresherFriendly");
        if (isFresherFilter) {
            queryParams.put("isFresherFriendly", true);
            logger.info("Fresher filter enabled, sending isFresherFriendly=true to JM API");
        }
        
        // Save original pagination for later
        int requestedPage = searchRequest.getPage() != null ? searchRequest.getPage() : 0;
        int requestedSize = searchRequest.getSize() != null ? searchRequest.getSize() : 20;
        
        // If FTS is enabled, we need to fetch more data for server-side filtering
        // JM API doesn't support full-text search properly, so we handle it server-side
        if (isFTSEnabled) {
            queryParams.remove("search"); // Remove search from JM API query
            queryParams.remove("title");
            queryParams.remove("skill");
            
            // Fetch multiple pages from JM API for comprehensive search
            // JM API constraints: page >= 1, limit <= 30
            List<JobPostDto> allJobs = new java.util.ArrayList<>();
            int maxPages = 17; // Fetch up to 17 pages
            int pageSize = 30; // JM API max limit is 30 jobs per page = 510 jobs max
            
            for (int p = 1; p <= maxPages; p++) { // JM API page starts from 1
                queryParams.put("page", p);
                queryParams.put("limit", pageSize);
                
                String url = buildUrlWithQueryParams(externalUrl.getJobPostsUrl(), queryParams);
                HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
                
                try {
                    ResponseEntity<JobPostListResponse> response = restTemplate.exchange(
                        url, HttpMethod.GET, entity, JobPostListResponse.class
                    );
                    
                    JobPostListResponse pageResult = response.getBody();
                    if (pageResult != null && pageResult.getJobs() != null && !pageResult.getJobs().isEmpty()) {
                        allJobs.addAll(pageResult.getJobs());
                        
                        // Stop if we got less than full page (no more data)
                        if (pageResult.getJobs().size() < pageSize) {
                            break;
                        }
                    } else {
                        break; // No more data
                    }
                } catch (Exception e) {
                    logger.warn("Error fetching page {} for FTS: {}", p, e.getMessage());
                    break;
                }
            }
            
            logger.info("FTS: Fetched {} total jobs from JM API for search '{}'", allJobs.size(), searchQuery);
            
            // Apply all filters on the combined dataset
            List<JobPostDto> filteredJobs = allJobs;
            
            // NOTE: When FTS is enabled, we intentionally SKIP location filter
            // to allow users to search across ALL jobs globally
            // This provides better UX - user searching for a specific job should find it
            // regardless of their default location filter
            logger.info("FTS mode: Skipping location filter to search globally");
            
            // Apply multi-employment-type filtering
            if (isMultiEmploymentTypeFilter) {
                List<String> upperCaseTypes = employmentTypes.stream()
                    .map(String::toUpperCase)
                    .collect(Collectors.toList());
                    
                filteredJobs = filteredJobs.stream()
                    .filter(job -> {
                        List<String> jobTypes = job.getEmploymentType();
                        if (jobTypes == null || jobTypes.isEmpty()) return false;
                        return jobTypes.stream().anyMatch(jt -> upperCaseTypes.contains(jt.toUpperCase()));
                    })
                    .collect(Collectors.toList());
            }
            
            // Apply fresher filter
            if (isFresherFilter) {
                filteredJobs = filteredJobs.stream()
                    .filter(job -> Boolean.TRUE.equals(job.getIsFresherFriendly()))
                    .collect(Collectors.toList());
            }
            
            // Apply Full-Text Search (FTS) - search across title, description, and skills
            String searchLower = searchQuery.toLowerCase().trim();
            String[] searchTokens = searchLower.split("\\s+");
            
            int beforeFTS = filteredJobs.size();
            filteredJobs = filteredJobs.stream()
                .filter(job -> matchesFTS(job, searchTokens))
                .collect(Collectors.toList());
            logger.info("FTS '{}': {}/{} jobs matched", searchQuery, filteredJobs.size(), beforeFTS);
            
            // Apply server-side pagination
            // Note: Frontend sends 1-based page (page=1 is first page)
            // Convert to 0-based for subList: page 1 → index 0
            int totalMatched = filteredJobs.size();
            int zeroBasedPage = Math.max(0, requestedPage - 1); // Convert 1-based to 0-based
            int startIndex = zeroBasedPage * requestedSize;
            int endIndex = Math.min(startIndex + requestedSize, totalMatched);
            
            List<JobPostDto> paginatedJobs;
            if (startIndex < totalMatched) {
                paginatedJobs = filteredJobs.subList(startIndex, endIndex);
            } else {
                paginatedJobs = List.of();
            }
            
            logger.info("Server-side pagination: page={}, size={}, returning {}/{} total matched", 
                requestedPage, requestedSize, paginatedJobs.size(), totalMatched);
            
            // Build response
            JobPostListResponse result = new JobPostListResponse();
            result.setJobs(paginatedJobs);
            result.setTotalCount(totalMatched);
            result.setPage(requestedPage);
            
            return result;
        }
        
        // Normal flow (no FTS) - single page fetch
        String url = buildUrlWithQueryParams(externalUrl.getJobPostsUrl(), queryParams);
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
        
        ResponseEntity<JobPostListResponse> response = restTemplate.exchange(
            url, HttpMethod.GET, entity, JobPostListResponse.class
        );
        
        JobPostListResponse result = response.getBody();
        
        if (result != null && result.getJobs() != null) {
            List<JobPostDto> filteredJobs = result.getJobs();
            
            // Apply country-level filtering if needed
            if (isCountryFilter) {
                filteredJobs = filteredJobs.stream()
                    .filter(job -> locationMappingService.locationMatchesCountry(job.getLocation(), locationFilter))
                    .collect(Collectors.toList());
                logger.info("Location filter '{}': {}/{} jobs matched", locationFilter, filteredJobs.size(), result.getJobs().size());
            }
            
            // Apply multi-employment-type filtering if needed
            if (isMultiEmploymentTypeFilter) {
                List<String> upperCaseTypes = employmentTypes.stream()
                    .map(String::toUpperCase)
                    .collect(Collectors.toList());
                    
                filteredJobs = filteredJobs.stream()
                    .filter(job -> {
                        List<String> jobTypes = job.getEmploymentType();
                        if (jobTypes == null || jobTypes.isEmpty()) return false;
                        return jobTypes.stream().anyMatch(jt -> upperCaseTypes.contains(jt.toUpperCase()));
                    })
                    .collect(Collectors.toList());
                logger.info("Employment type filter {}: {}/{} jobs matched", employmentTypes, filteredJobs.size(), result.getJobs().size());
            }
            
            // Apply fresher-friendly filtering if needed
            if (isFresherFilter) {
                int beforeCount = filteredJobs.size();
                filteredJobs = filteredJobs.stream()
                    .filter(job -> Boolean.TRUE.equals(job.getIsFresherFriendly()))
                    .collect(Collectors.toList());
                logger.info("Fresher filter: {}/{} jobs matched", filteredJobs.size(), beforeCount);
            }
            
            // Update the response with filtered jobs
            result.setJobs(filteredJobs);
            result.setTotalCount(filteredJobs.size());
        }
        
        return result;
    }
    
    /**
     * Full-Text Search (FTS) matcher
     * Searches across Title, Description, and Required Skills fields
     * Returns true if ALL search tokens are found in ANY of these fields
     */
    private boolean matchesFTS(JobPostDto job, String[] searchTokens) {
        StringBuilder searchableText = new StringBuilder();
        
        if (job.getTitle() != null) {
            searchableText.append(job.getTitle().toLowerCase()).append(" ");
        }
        if (job.getDescription() != null) {
            searchableText.append(job.getDescription().toLowerCase()).append(" ");
        }
        List<String> skills = job.getRequiredSkills();
        if (skills != null && !skills.isEmpty()) {
            for (String skill : skills) {
                if (skill != null) {
                    searchableText.append(skill.toLowerCase()).append(" ");
                }
            }
        }
        
        String fullText = searchableText.toString();
        
        for (String token : searchTokens) {
            if (!fullText.contains(token)) {
                return false;
            }
        }
        return true;
    }
    
    @Override
    public JobPostListResponse searchJobPosts(Map<String, Object> queryParams) {
        // Check if location filter is a country name
        String locationFilter = queryParams.get("location") != null ? queryParams.get("location").toString() : null;
        boolean isCountryFilter = locationMappingService.isCountry(locationFilter);
        
        // If it's a country, remove location from query params (we'll filter after fetch)
        if (isCountryFilter) {
            queryParams.remove("location");
            logger.info("Smart location filtering: '{}' detected as country, will filter server-side", locationFilter);
        }
        
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
        
        JobPostListResponse result = response.getBody();
        
        // Apply country-level filtering if needed
        if (result != null && isCountryFilter && result.getJobs() != null) {
            List<JobPostDto> filteredJobs = result.getJobs().stream()
                .filter(job -> locationMappingService.locationMatchesCountry(job.getLocation(), locationFilter))
                .collect(Collectors.toList());
            
            int originalCount = result.getJobs().size();
            logger.info("Location filter '{}': {}/{} jobs matched", locationFilter, filteredJobs.size(), originalCount);
            
            // Update the response with filtered jobs
            result.setJobs(filteredJobs);
            result.setTotalCount(filteredJobs.size());
        }
        
        return result;
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
                // Handle List types - add each item as separate query param
                if (value instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Object> listValue = (List<Object>) value;
                    for (Object item : listValue) {
                        if (item != null) {
                            uriBuilder.queryParam(key, item.toString());
                        }
                    }
                } else {
                    uriBuilder.queryParam(key, value.toString());
                }
            }
        });
        
        return uriBuilder.toUriString();
    }
    
    /**
     * Delete a job post from JM system (Admin operation)
     * Requirement 6.2.2: Administrators shall be able to delete any Job Post
     * 
     * @param jobPostId The ID of the job post to delete
     * @param authorizationHeader User's JWT token to forward to JM API
     * @return true if deletion was successful, false otherwise
     */
    @Override
    public boolean deleteJobPost(String jobPostId, String authorizationHeader) {
        String url = externalUrl.getJobPostsUrl() + "/" + jobPostId;
        
        try {
            // Use user's JWT token for authentication with JM API
            // This ensures the admin user's permissions are validated by JM
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authorizationHeader);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Void> response = restTemplate.exchange(
                url,
                HttpMethod.DELETE,
                entity,
                Void.class
            );
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("Job post deletion {}: jobPostId={}", success ? "successful" : "failed", jobPostId);
            return success;
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            logger.warn("Job post not found for deletion: {}", jobPostId);
            return false;
        } catch (org.springframework.web.client.RestClientException e) {
            logger.error("Error deleting job post {}: {}", jobPostId, e.getMessage());
            throw new RuntimeException("Failed to delete job post from JM system: " + e.getMessage(), e);
        }
    }
}
