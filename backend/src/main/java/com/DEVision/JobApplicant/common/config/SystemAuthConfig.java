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
     * Job Manager System API URL for token verification (optional - for API-based verification)
     */
    @Value("${system.auth.job-manager.verify-token-url:}")
    private String jobManagerVerifyTokenUrl;
    
    /**
     * Expected issuer claim in Job Manager tokens
     * e.g., "JOB_MANAGER_SYSTEM" or "job-manager-api"
     */
    @Value("${system.auth.job-manager.expected-issuer:JOB_MANAGER_SYSTEM}")
    private String jobManagerExpectedIssuer;
    
    /**
     * Expected system ID claim in Job Manager tokens
     * This should match the system identifier in the token claims
     */
    @Value("${system.auth.job-manager.expected-system-id:JOB_MANAGER_SYSTEM}")
    private String jobManagerExpectedSystemId;
    
    /**
     * Enable direct JWE token verification (decrypt and verify locally)
     * 
     * NOTE: This only works if JM encrypted the token with YOUR public key.
     * This is NOT the normal case - normally JM uses their own keys.
     * 
     * Set to false to use API-based verification only (recommended).
     */
    @Value("${system.auth.job-manager.verify-locally:false}")
    private boolean verifyLocally;
    
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
    
    public String getJobManagerExpectedIssuer() {
        return jobManagerExpectedIssuer;
    }
    
    public String getJobManagerExpectedSystemId() {
        return jobManagerExpectedSystemId;
    }
    
    public boolean isVerifyLocally() {
        return verifyLocally;
    }
    
    public boolean isJobManagerConfigured() {
        // Configured if API URL is provided (required for normal JWE tokens from external systems)
        // OR local verification is enabled (only works if JM encrypted with our public key)
        return (jobManagerVerifyTokenUrl != null && !jobManagerVerifyTokenUrl.isEmpty()) || verifyLocally;
    }
}
