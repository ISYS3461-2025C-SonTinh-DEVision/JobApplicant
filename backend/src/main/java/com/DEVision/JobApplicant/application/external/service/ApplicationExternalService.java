package com.DEVision.JobApplicant.application.external.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.application.entity.Application;
import com.DEVision.JobApplicant.application.external.dto.ApplicationRequest;
import com.DEVision.JobApplicant.application.external.dto.ApplicationResponse;
import com.DEVision.JobApplicant.application.service.ApplicationService;
import com.DEVision.JobApplicant.activity.service.ActivityService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * External service for other backend modules/systems to interact with applications
 * Main purpose: Other systems can call this to create applications or retrieve application data
 */
@Service
public class ApplicationExternalService {
    
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private ActivityService activityService;
    
    /**
     * Create a new application or re-apply after withdrawal
     */
    public ApplicationResponse createApplication(ApplicationRequest request) {
        Application existing = applicationService.getApplicationByJobPostAndApplicant(
            request.getJobPostId(), request.getApplicantId());
        
        Application application;
        
        if (existing != null) {
            if (existing.getStatus() == Application.ApplicationStatus.WITHDRAWN) {
                // Re-applying after withdrawal - update existing application
                application = existing;
            } else {
                // Active application exists - reject
                throw new DuplicateApplicationException("You have already applied for this job. Please choose a different position.");
            }
        } else {
            // New application
            application = new Application();
            application.setJobPostId(request.getJobPostId());
            application.setApplicantId(request.getApplicantId());
        }
        
        // Set/update application data
        application.setCvUrl(request.getCvUrl());
        application.setCvPublicId(request.getCvPublicId());
        application.setCoverLetterUrl(request.getCoverLetterUrl());
        application.setCoverLetterPublicId(request.getCoverLetterPublicId());
        application.setJobTitle(request.getJobTitle());
        application.setCompanyName(request.getCompanyName());
        application.setLocation(request.getLocation());
        application.setEmploymentType(request.getEmploymentType());
        application.setStatus(Application.ApplicationStatus.PENDING);
        application.setAppliedAt(java.time.LocalDateTime.now());
        
        Application saved = applicationService.updateApplication(application);
        
        // Record activity
        try {
            String jobTitle = request.getJobTitle() != null ? request.getJobTitle() : "a position";
            String company = request.getCompanyName() != null ? request.getCompanyName() : "a company";
            activityService.recordApplicationSubmit(jobTitle, company);
        } catch (Exception e) {
            System.err.println("Failed to record application activity: " + e.getMessage());
        }
        
        return toResponse(saved);
    }
    
    /**
     * Custom exception for duplicate applications
     */
    public static class DuplicateApplicationException extends RuntimeException {
        public DuplicateApplicationException(String message) {
            super(message);
        }
    }
    
    /**
     * Get all applications for a job post
     * Used by job posting system to see who applied.
     * This method is now read-only and does NOT change application status.
     */
    public List<ApplicationResponse> getApplicationsByJobPostId(String jobPostId) {
        List<Application> applications = applicationService.getApplicationsByJobPostId(jobPostId);
        return applications.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get application by ID.
     * This method is now read-only and does NOT change application status.
     */
    public ApplicationResponse getApplicationById(String id) {
        Application application = applicationService.getApplicationById(id);
        if (application != null) {
            return toResponse(application);
        }
        return null;
    }
    
    /**
     * Update application status
     * Used by job posting system to update application status
     */
    public ApplicationResponse updateApplicationStatus(String id, Application.ApplicationStatus status) {
        Application application = applicationService.updateApplicationStatus(id, status);
        return application != null ? toResponse(application) : null;
    }
    
    /**
     * Get count of applications for a job post
     */
    public long getApplicationCountByJobPostId(String jobPostId) {
        return applicationService.countApplicationsByJobPostId(jobPostId);
    }
    
    // Convert entity to response DTO
    private ApplicationResponse toResponse(Application application) {
        return new ApplicationResponse(
            application.getId(),
            application.getJobPostId(),
            application.getApplicantId(),
            application.getCvUrl(),
            application.getCvPublicId(),
            application.getCoverLetterUrl(),
            application.getCoverLetterPublicId(),
            application.getStatus(),
            application.getAppliedAt(),
            application.getUpdatedAt(),
            application.getJobTitle(),
            application.getCompanyName(),
            application.getLocation(),
            application.getEmploymentType()
        );
    }
}

