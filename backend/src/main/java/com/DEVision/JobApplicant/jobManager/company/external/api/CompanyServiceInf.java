package com.DEVision.JobApplicant.jobManager.company.external.api;

import com.DEVision.JobApplicant.jobManager.company.external.dto.*;

import java.util.Map;

/**
 * Interface for Company Service
 * Defines the contract for interacting with JM system's Company API
 */
public interface CompanyServiceInf {

    /**
     * Get company detail by ID from JM system
     * @param companyId The ID of the company
     * @return CompanyDto if found, null otherwise
     */
    CompanyDto getCompanyById(String companyId);

    /**
     * Get all companies with pagination and filtering support
     * @param searchRequest Search/filter request with query parameters
     * @return CompanyListResponse with paginated results
     */
    CompanyListResponse searchCompanies(CompanySearchRequest searchRequest);

    /**
     * Get all companies with custom query parameters
     * @param queryParams Map of query parameter names to values
     * @return CompanyListResponse with paginated results
     */
    CompanyListResponse searchCompanies(Map<String, Object> queryParams);

    /**
     * Activate a company account in JM system
     * @param accountId The account ID to activate
     * @return AccountActionResponse with result
     */
    AccountActionResponse activateAccount(String accountId);

    /**
     * Deactivate a company account in JM system
     * @param accountId The account ID to deactivate
     * @return AccountActionResponse with result
     */
    AccountActionResponse deactivateAccount(String accountId);
}
