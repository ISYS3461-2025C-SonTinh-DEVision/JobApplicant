package com.DEVision.JobApplicant.admin.service;

import com.DEVision.JobApplicant.admin.dto.*;

/**
 * Service interface for Admin operations
 */
public interface AdminService {

    /**
     * Get dashboard statistics
     * @return AdminStatsDto with statistics
     */
    AdminStatsDto getDashboardStats();

    /**
     * Get list of applicants with pagination and search
     * @param page Page number (1-indexed)
     * @param limit Items per page
     * @param search Search term
     * @return ApplicantListResponseDto with paginated applicants
     */
    ApplicantListResponseDto getApplicants(int page, int limit, String search);

    /**
     * Get single applicant details by ID
     * @param id Applicant ID
     * @return ApplicantDetailDto with applicant details
     */
    ApplicantDetailDto getApplicantById(String id);

    /**
     * Deactivate an applicant account
     * @param id Applicant ID
     * @return Success message
     */
    String deactivateApplicant(String id);

    /**
     * Activate an applicant account
     * @param id Applicant ID
     * @return Success message
     */
    String activateApplicant(String id);

    /**
     * Deactivate a company account in JM system
     * @param accountId Company account ID from JM
     * @return Success message
     */
    String deactivateCompany(String accountId);

    /**
     * Activate a company account in JM system
     * @param accountId Company account ID from JM
     * @return Success message
     */
    String activateCompany(String accountId);
}
