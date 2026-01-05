package com.DEVision.JobApplicant.jmintegration.jobpost.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * External URL configuration for JM (Job Manager) System
 * All external URLs are centralized here
 */
@Component
public class ExternalUrl {
    
    @Value("${app.job-manager.base-url:http://localhost:8081}")
    private String jobManagerBaseUrl;
    
    public static final String JM_SERVICE_PATH = "/api/job-posts";
    
    public String getJobManagerBaseUrl() {
        return jobManagerBaseUrl;
    }
    
    public String getJobPostsUrl() {
        return jobManagerBaseUrl + JM_SERVICE_PATH;
    }
}

