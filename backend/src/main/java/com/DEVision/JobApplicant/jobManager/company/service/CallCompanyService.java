package com.DEVision.JobApplicant.jobManager.company.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.DEVision.JobApplicant.auth.service.CognitoTokenService;
import com.DEVision.JobApplicant.jobManager.config.ExternalUrl;
import com.DEVision.JobApplicant.jobManager.company.external.api.CompanyServiceInf;
import com.DEVision.JobApplicant.jobManager.company.external.dto.*;

import java.util.Map;

/**
 * Service for calling JM system Company API
 * Implements the interface and uses RestTemplate to make HTTP calls
 * Supports query parameters for filtering, searching, and pagination
 */
@Service
public class CallCompanyService implements CompanyServiceInf {

    private static final Logger logger = LoggerFactory.getLogger(CallCompanyService.class);

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
    public CompanyDto getCompanyById(String companyId) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
            
            ResponseEntity<CompanyDto> response = restTemplate.exchange(
                externalUrl.getCompanyUrl() + "/{companyId}",
                HttpMethod.GET,
                entity,
                CompanyDto.class,
                companyId
            );
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Company not found with ID: {}", companyId);
            return null;
        } catch (RestClientException e) {
            logger.error("Error fetching company by ID: {}", companyId, e);
            throw new RuntimeException("Failed to fetch company from JM system", e);
        }
    }

    @Override
    public CompanyListResponse searchCompanies(CompanySearchRequest searchRequest) {
        String url = buildUrlWithQueryParams(
            externalUrl.getCompanyUrl(),
            searchRequest.toQueryParams()
        );

        try {
            HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
            
            ResponseEntity<CompanyListResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                CompanyListResponse.class
            );
            
            CompanyListResponse result = response.getBody();
            logger.debug("Fetched {} companies from JM",
                result != null && result.getCompanies() != null
                    ? result.getCompanies().size() : 0);
            return result;
        } catch (RestClientException e) {
            logger.error("Error searching companies with params: {}", searchRequest.toQueryParams(), e);
            throw new RuntimeException("Failed to search companies from JM system", e);
        }
    }

    @Override
    public CompanyListResponse searchCompanies(Map<String, Object> queryParams) {
        String url = buildUrlWithQueryParams(externalUrl.getCompanyUrl(), queryParams);

        try {
            HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
            
            ResponseEntity<CompanyListResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                CompanyListResponse.class
            );
            return response.getBody();
        } catch (RestClientException e) {
            logger.error("Error searching companies with params: {}", queryParams, e);
            throw new RuntimeException("Failed to search companies from JM system", e);
        }
    }

    @Override
    public AccountActionResponse activateAccount(String accountId) {
        String url = externalUrl.getAuthAccountUrl() + "/" + accountId + "/active";

        try {
            HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
            
            ResponseEntity<AccountActionResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                AccountActionResponse.class
            );

            logger.info("Account activated successfully: {}", accountId);
            logger.debug("JM Response: {}", response.getBody());

            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            // JM API doesn't have this endpoint - return user-friendly message
            logger.warn("Activate endpoint not found in JM system for account {}: {}", accountId, e.getMessage());
            AccountActionResponse errorResponse = new AccountActionResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Company activation is not supported by the Job Manager system. " +
                "This feature may be available in a future update.");
            errorResponse.setStatusCode(404);
            return errorResponse;
        } catch (HttpClientErrorException e) {
            logger.error("Error activating account {}: {} - {}",
                accountId, e.getStatusCode(), e.getResponseBodyAsString());

            // Return error response
            AccountActionResponse errorResponse = new AccountActionResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Failed to activate account: " + e.getMessage());
            errorResponse.setStatusCode(e.getStatusCode().value());
            return errorResponse;
        } catch (RestClientException e) {
            logger.error("Error activating account: {}", accountId, e);
            throw new RuntimeException("Failed to activate account in JM system", e);
        }
    }

    @Override
    public AccountActionResponse deactivateAccount(String accountId) {
        String url = externalUrl.getAuthAccountUrl() + "/" + accountId + "/deactivate";

        try {
            HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());
            
            ResponseEntity<AccountActionResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                AccountActionResponse.class
            );

            logger.info("Account deactivated successfully: {}", accountId);
            logger.debug("JM Response: {}", response.getBody());

            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            // JM API doesn't have this endpoint - return user-friendly message
            logger.warn("Deactivate endpoint not found in JM system for account {}: {}", accountId, e.getMessage());
            AccountActionResponse errorResponse = new AccountActionResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Company deactivation is not supported by the Job Manager system. " +
                "This feature may be available in a future update.");
            errorResponse.setStatusCode(404);
            return errorResponse;
        } catch (HttpClientErrorException e) {
            logger.error("Error deactivating account {}: {} - {}",
                accountId, e.getStatusCode(), e.getResponseBodyAsString());

            // Return error response
            AccountActionResponse errorResponse = new AccountActionResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Failed to deactivate account: " + e.getMessage());
            errorResponse.setStatusCode(e.getStatusCode().value());
            return errorResponse;
        } catch (RestClientException e) {
            logger.error("Error deactivating account: {}", accountId, e);
            throw new RuntimeException("Failed to deactivate account in JM system", e);
        }
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
                uriBuilder.queryParam(key, value);
            }
        });

        return uriBuilder.toUriString();
    }
}
