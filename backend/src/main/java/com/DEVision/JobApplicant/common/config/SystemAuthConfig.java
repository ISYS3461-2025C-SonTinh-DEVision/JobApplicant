package com.DEVision.JobApplicant.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for system-to-system authentication
 * Used for authenticating requests from external systems like Job Manager System
 */
@Configuration
public class SystemAuthConfig {
    
    /**
     * Job Manager System API URL for token verification
     * e.g., http://job-manager-api.com/api/auth/verify-token
     */
    @Value("${system.auth.job-manager.verify-token-url:}")
    private String jobManagerVerifyTokenUrl;
    
    /**
     * Header name for system authorization token
     */
    public static final String SYSTEM_AUTH_HEADER = "X-System-Authorization";
    
    /**
     * System identifier for Job Manager System
     */
    public static final String JOB_MANAGER_SYSTEM = "JOB_MANAGER_SYSTEM";
    
    public String getJobManagerVerifyTokenUrl() {
        return jobManagerVerifyTokenUrl;
    }
    
    public boolean isJobManagerConfigured() {
        return jobManagerVerifyTokenUrl != null && !jobManagerVerifyTokenUrl.isEmpty();
    }
}
