package com.DEVision.JobApplicant.application.internal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.application.entity.Application;
import com.DEVision.JobApplicant.application.external.dto.ApplicationResponse;
import com.DEVision.JobApplicant.application.external.service.ApplicationExternalService;
import com.DEVision.JobApplicant.application.internal.dto.ApplicationHistoryResponse;
import com.DEVision.JobApplicant.application.internal.dto.ApplicationListResponse;
import com.DEVision.JobApplicant.application.internal.dto.CreateApplicationRequest;
import com.DEVision.JobApplicant.application.service.ApplicationService;
import com.DEVision.JobApplicant.common.storage.dto.FileUploadResult;
import com.DEVision.JobApplicant.common.storage.service.FileStorageService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Internal service for application module's own business logic
 */
@Service
public class ApplicationInternalService {
    
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private ApplicationExternalService externalService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    // Allowed file types for CV and Cover Letter
    private static final Set<String> ALLOWED_FILE_TYPES = Set.of(
        "application/pdf",           // PDF
        "application/msword",      // DOC
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX
    );
    
    private static final Set<String> ALLOWED_FILE_EXTENSIONS = Set.of(
        "pdf", "doc", "docx"
    );
    
    /**
     * Validate file type for CV and Cover Letter
     */
    private void validateFileType(MultipartFile file, String fileType) {
        if (file == null || file.isEmpty()) {
            return; // Skip validation for empty files
        }
        
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        
        // Check MIME type
        if (contentType != null && !ALLOWED_FILE_TYPES.contains(contentType.toLowerCase())) {
            // Check file extension as fallback
            if (originalFilename != null) {
                String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
                if (!ALLOWED_FILE_EXTENSIONS.contains(extension)) {
                    throw new IllegalArgumentException(
                        String.format("Invalid %s file type. Allowed types: PDF, DOC, DOCX", fileType)
                    );
                }
            } else {
                throw new IllegalArgumentException(
                    String.format("Invalid %s file type. Allowed types: PDF, DOC, DOCX", fileType)
                );
            }
        }
    }
    
    /**
     * Create application with file uploads
     * Handles CV (required) and Cover Letter (optional) uploads
     */
    public ApplicationResponse createApplication(
            String applicantId,
            CreateApplicationRequest request,
            MultipartFile cvFile,
            MultipartFile coverLetterFile) {
        
        // Validate CV file is provided
        if (cvFile == null || cvFile.isEmpty()) {
            throw new IllegalArgumentException("CV file is required");
        }
        
        // Validate CV file type
        validateFileType(cvFile, "CV");
        
        // Upload CV file
        FileUploadResult cvUploadResult = fileStorageService.uploadFile(cvFile, "applications/cv");
        
        // Upload Cover Letter file if provided
        FileUploadResult coverLetterUploadResult = null;
        if (coverLetterFile != null && !coverLetterFile.isEmpty()) {
            // Validate Cover Letter file type
            validateFileType(coverLetterFile, "Cover Letter");
            coverLetterUploadResult = fileStorageService.uploadFile(coverLetterFile, "applications/cover-letters");
        }
        
        // Create application request
        com.DEVision.JobApplicant.application.external.dto.ApplicationRequest appRequest = 
            new com.DEVision.JobApplicant.application.external.dto.ApplicationRequest();
        appRequest.setJobPostId(request.getJobPostId());
        appRequest.setApplicantId(applicantId);
        appRequest.setCvUrl(cvUploadResult.fileUrl());
        appRequest.setCvPublicId(cvUploadResult.publicId());
        appRequest.setJobTitle(request.getJobTitle());
        appRequest.setCompanyName(request.getCompanyName());
        
        if (coverLetterUploadResult != null) {
            appRequest.setCoverLetterUrl(coverLetterUploadResult.fileUrl());
            appRequest.setCoverLetterPublicId(coverLetterUploadResult.publicId());
        }
        
        return externalService.createApplication(appRequest);
    }
    
    /**
     * Get all applications for user with metadata and pagination
     * @param applicantId the applicant ID
     * @param statusFilter optional status filter (null for all applications)
     * @param page page number (0-based), null for no pagination
     * @param size page size, null for no pagination
     */
    public ApplicationListResponse getUserApplications(String applicantId, Application.ApplicationStatus statusFilter, 
                                                        Integer page, Integer size) {
        // If pagination parameters are provided, use pagination
        if (page != null && size != null && size > 0) {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
            Page<Application> applicationPage;
            
            if (statusFilter != null) {
                applicationPage = applicationService.getApplicationsByApplicantIdAndStatus(applicantId, statusFilter, pageable);
            } else {
                applicationPage = applicationService.getApplicationsByApplicantId(applicantId, pageable);
            }
            
            List<ApplicationResponse> responseList = applicationPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
            
            return new ApplicationListResponse(
                responseList,
                applicationPage.getTotalElements(),
                applicationPage.getNumber(),
                applicationPage.getSize(),
                applicationPage.getTotalPages()
            );
        }
        
        // No pagination - return all results
        List<Application> applications;
        if (statusFilter != null) {
            applications = applicationService.getApplicationsByApplicantIdAndStatus(applicantId, statusFilter);
        } else {
            applications = applicationService.getApplicationsByApplicantId(applicantId);
        }
        
        List<ApplicationResponse> responseList = applications.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return new ApplicationListResponse(responseList, applications.size());
    }
    
    /**
     * Get application by ID for a specific user
     */
    public ApplicationResponse getUserApplication(String applicationId, String applicantId) {
        Application application = applicationService.getApplicationById(applicationId);
        if (application != null && application.getApplicantId().equals(applicantId)) {
            return toResponse(application);
        }
        return null;
    }
    
    /**
     * Withdraw application (change status to WITHDRAWN)
     */
    public ApplicationResponse withdrawApplication(String applicationId, String applicantId) {
        Application application = applicationService.getApplicationById(applicationId);
        if (application != null && application.getApplicantId().equals(applicantId)) {
            application = applicationService.updateApplicationStatus(applicationId, Application.ApplicationStatus.WITHDRAWN);
            return application != null ? toResponse(application) : null;
        }
        return null;
    }
    
    /**
     * Delete application (only if it belongs to the user)
     */
    public boolean deleteApplication(String applicationId, String applicantId) {
        Application application = applicationService.getApplicationById(applicationId);
        if (application != null && application.getApplicantId().equals(applicantId)) {
            // Delete files from storage
            try {
                fileStorageService.deleteFile(application.getCvPublicId(), "raw");
                if (application.getCoverLetterPublicId() != null) {
                    fileStorageService.deleteFile(application.getCoverLetterPublicId(), "raw");
                }
            } catch (Exception e) {
                System.err.println("Error deleting files from storage: " + e.getMessage());
                // Continue with application deletion even if file deletion fails
            }
            
            return applicationService.deleteApplication(applicationId);
        }
        return false;
    }
    
    /**
     * Get application history with statistics
     * Returns all applications sorted by date (most recent first) with statistics
     */
    public ApplicationHistoryResponse getApplicationHistory(String applicantId) {
        // Get all applications for the applicant, sorted by applied date (most recent first)
        List<Application> applications = applicationService.getApplicationsByApplicantId(applicantId);
        
        // Sort by appliedAt descending (most recent first)
        applications.sort((a1, a2) -> {
            if (a1.getAppliedAt() == null && a2.getAppliedAt() == null) return 0;
            if (a1.getAppliedAt() == null) return 1;
            if (a2.getAppliedAt() == null) return -1;
            return a2.getAppliedAt().compareTo(a1.getAppliedAt());
        });
        
        // Convert to response DTOs
        List<ApplicationResponse> responseList = applications.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        // Calculate statistics
        long totalApplications = applications.size();
        long pendingCount = applicationService.countApplicationsByApplicantIdAndStatus(applicantId, Application.ApplicationStatus.PENDING);
        long reviewingCount = applicationService.countApplicationsByApplicantIdAndStatus(applicantId, Application.ApplicationStatus.REVIEWING);
        long acceptedCount = applicationService.countApplicationsByApplicantIdAndStatus(applicantId, Application.ApplicationStatus.ACCEPTED);
        long rejectedCount = applicationService.countApplicationsByApplicantIdAndStatus(applicantId, Application.ApplicationStatus.REJECTED);
        long withdrawnCount = applicationService.countApplicationsByApplicantIdAndStatus(applicantId, Application.ApplicationStatus.WITHDRAWN);
        
        // Create status counts map
        Map<Application.ApplicationStatus, Long> statusCounts = new HashMap<>();
        statusCounts.put(Application.ApplicationStatus.PENDING, pendingCount);
        statusCounts.put(Application.ApplicationStatus.REVIEWING, reviewingCount);
        statusCounts.put(Application.ApplicationStatus.ACCEPTED, acceptedCount);
        statusCounts.put(Application.ApplicationStatus.REJECTED, rejectedCount);
        statusCounts.put(Application.ApplicationStatus.WITHDRAWN, withdrawnCount);
        
        ApplicationHistoryResponse.ApplicationHistoryStatistics statistics = 
            new ApplicationHistoryResponse.ApplicationHistoryStatistics(
                totalApplications,
                pendingCount,
                reviewingCount,
                acceptedCount,
                rejectedCount,
                withdrawnCount
            );
        statistics.setStatusCounts(statusCounts);
        
        return new ApplicationHistoryResponse(responseList, statistics);
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
            application.getCompanyName()
        );
    }
}

