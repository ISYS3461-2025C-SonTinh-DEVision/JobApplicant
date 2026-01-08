package com.DEVision.JobApplicant.jobManager.company.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

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

    @Override
    public CompanyDto getCompanyById(String companyId) {
        try {
            // Note: Assuming single company endpoint exists, update when JM provides spec
            CompanyDto response = restTemplate.getForObject(
                externalUrl.getCompanyUrl() + "/{companyId}",
                CompanyDto.class,
                companyId
            );
            return response;
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
            CompanyListResponse response = restTemplate.getForObject(url, CompanyListResponse.class);
            logger.debug("Fetched {} companies from JM",
                response != null && response.getCompanies() != null
                    ? response.getCompanies().size() : 0);
            return response;
        } catch (RestClientException e) {
            logger.error("Error searching companies with params: {}", searchRequest.toQueryParams(), e);
            throw new RuntimeException("Failed to search companies from JM system", e);
        }
    }

    @Override
    public CompanyListResponse searchCompanies(Map<String, Object> queryParams) {
        String url = buildUrlWithQueryParams(externalUrl.getCompanyUrl(), queryParams);

        try {
            return restTemplate.getForObject(url, CompanyListResponse.class);
        } catch (RestClientException e) {
            logger.error("Error searching companies with params: {}", queryParams, e);
            throw new RuntimeException("Failed to search companies from JM system", e);
        }
    }

    @Override
    public AccountActionResponse activateAccount(String accountId) {
        String url = externalUrl.getAuthAccountUrl() + "/" + accountId + "/active";

        try {
            // TODO: Update request body when JM team provides spec
            // Currently sending empty body as POST
            AccountActionResponse response = restTemplate.postForObject(
                url,
                null,  // Empty body - update when spec is available
                AccountActionResponse.class
            );

            logger.info("Account activated successfully: {}", accountId);
            logger.debug("JM Response: {}", response);

            return response;
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
            // TODO: Update request body when JM team provides spec
            // Currently sending empty body as POST
            AccountActionResponse response = restTemplate.postForObject(
                url,
                null,  // Empty body - update when spec is available
                AccountActionResponse.class
            );

            logger.info("Account deactivated successfully: {}", accountId);
            logger.debug("JM Response: {}", response);

            return response;
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
