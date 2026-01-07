package com.DEVision.JobApplicant.jobManager.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Centralized External URL configuration for JM (Job Manager) System
 * Shared across all Job Manager integration modules (jobpost, company)
 * All external URLs are centralized here for easier maintenance
 */
@Component
public class ExternalUrl {

    @Value("${app.job-manager.base-url:http://localhost:8081}")
    private String jobManagerBaseUrl;

    // Job Post endpoints
    public static final String JM_JOBPOST_PATH = "/api/job-posts";

    // Company endpoints
    public static final String JM_COMPANY_PATH = "/api/company";

    // Auth Account endpoints
    public static final String JM_AUTH_ACCOUNT_PATH = "/api/auth/account";

    public String getJobManagerBaseUrl() {
        return jobManagerBaseUrl;
    }

    public String getJobPostsUrl() {
        return jobManagerBaseUrl + JM_JOBPOST_PATH;
    }

    public String getCompanyUrl() {
        return jobManagerBaseUrl + JM_COMPANY_PATH;
    }

    public String getAuthAccountUrl() {
        return jobManagerBaseUrl + JM_AUTH_ACCOUNT_PATH;
    }
}
