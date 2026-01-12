package com.DEVision.JobApplicant.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.application.entity.Application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    // Create a new application
    public Application createApplication(Application application) {
        if (application.getAppliedAt() == null) {
            application.setAppliedAt(LocalDateTime.now());
        }
        if (application.getStatus() == null) {
            application.setStatus(Application.ApplicationStatus.PENDING);
        }
        return applicationRepository.save(application);
    }
    
    // Get application by ID
    public Application getApplicationById(String id) {
        Optional<Application> application = applicationRepository.findById(id);
        return application.orElse(null);
    }
    
    // Get all applications for a job post
    public List<Application> getApplicationsByJobPostId(String jobPostId) {
        return applicationRepository.findByJobPostId(jobPostId);
    }
    
    // Get all applications by an applicant
    public List<Application> getApplicationsByApplicantId(String applicantId) {
        return applicationRepository.findByApplicantId(applicantId);
    }
    
    // Get all applications by an applicant (paginated)
    public Page<Application> getApplicationsByApplicantId(String applicantId, Pageable pageable) {
        return applicationRepository.findByApplicantId(applicantId, pageable);
    }
    
    // Get applications by status for a job post
    public List<Application> getApplicationsByJobPostIdAndStatus(String jobPostId, Application.ApplicationStatus status) {
        return applicationRepository.findByJobPostIdAndStatus(jobPostId, status);
    }
    
    // Get applications by status for an applicant
    public List<Application> getApplicationsByApplicantIdAndStatus(String applicantId, Application.ApplicationStatus status) {
        return applicationRepository.findByApplicantIdAndStatus(applicantId, status);
    }
    
    // Get applications by status for an applicant (paginated)
    public Page<Application> getApplicationsByApplicantIdAndStatus(String applicantId, Application.ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByApplicantIdAndStatus(applicantId, status, pageable);
    }
    
    // Check if applicant already applied to a job post (active application only)
    public boolean hasApplicantApplied(String jobPostId, String applicantId) {
        Application existing = applicationRepository.findByJobPostIdAndApplicantId(jobPostId, applicantId);
        // Allow re-apply if no application or if previous was withdrawn
        return existing != null && existing.getStatus() != Application.ApplicationStatus.WITHDRAWN;
    }
    
    // Get existing application by job post and applicant
    public Application getApplicationByJobPostAndApplicant(String jobPostId, String applicantId) {
        return applicationRepository.findByJobPostIdAndApplicantId(jobPostId, applicantId);
    }
    
    // Update application status
    public Application updateApplicationStatus(String id, Application.ApplicationStatus status) {
        Optional<Application> optionalApplication = applicationRepository.findById(id);
        if (optionalApplication.isPresent()) {
            Application application = optionalApplication.get();
            application.setStatus(status);
            application.setUpdatedAt(LocalDateTime.now());
            return applicationRepository.save(application);
        }
        return null;
    }
    
    // Update application
    public Application updateApplication(Application application) {
        application.setUpdatedAt(LocalDateTime.now());
        return applicationRepository.save(application);
    }
    
    // Delete application
    public boolean deleteApplication(String id) {
        if (applicationRepository.existsById(id)) {
            applicationRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Count applications for a job post
    public long countApplicationsByJobPostId(String jobPostId) {
        return applicationRepository.countByJobPostId(jobPostId);
    }
    
    // Count applications by an applicant
    public long countApplicationsByApplicantId(String applicantId) {
        return applicationRepository.countByApplicantId(applicantId);
    }
    
    // Count applications by an applicant and status
    public long countApplicationsByApplicantIdAndStatus(String applicantId, Application.ApplicationStatus status) {
        return applicationRepository.countByApplicantIdAndStatus(applicantId, status);
    }
}

