package com.DEVision.JobApplicant.application.internal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.application.entity.Application;
import com.DEVision.JobApplicant.application.external.dto.ApplicationResponse;
import com.DEVision.JobApplicant.application.external.service.ApplicationExternalService;
import com.DEVision.JobApplicant.application.internal.dto.ApplicationListResponse;
import com.DEVision.JobApplicant.application.internal.dto.CreateApplicationRequest;
import com.DEVision.JobApplicant.application.service.ApplicationService;
import com.DEVision.JobApplicant.common.storage.dto.FileUploadResult;
import com.DEVision.JobApplicant.common.storage.service.FileStorageService;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
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
     * Get all applications for user with metadata
     * @param applicantId the applicant ID
     * @param statusFilter optional status filter (null for all applications)
     */
    public ApplicationListResponse getUserApplications(String applicantId, Application.ApplicationStatus statusFilter) {
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

