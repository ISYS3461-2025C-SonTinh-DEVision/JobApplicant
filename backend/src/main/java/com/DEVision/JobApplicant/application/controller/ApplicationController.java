package com.DEVision.JobApplicant.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.DEVision.JobApplicant.application.entity.Application;
import com.DEVision.JobApplicant.application.external.dto.ApplicationResponse;
import com.DEVision.JobApplicant.application.external.service.ApplicationExternalService;
import com.DEVision.JobApplicant.application.internal.dto.ApplicationListResponse;
import com.DEVision.JobApplicant.application.internal.dto.CreateApplicationRequest;
import com.DEVision.JobApplicant.application.internal.service.ApplicationInternalService;
import com.DEVision.JobApplicant.auth.external.service.AuthExternalService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API for application management
 */
@RestController
@RequestMapping("/api/applications")
@Tag(name = "Application Management",
     description = "Endpoints for managing job applications")
public class ApplicationController {
    
    @Autowired
    private ApplicationInternalService internalService;
    
    @Autowired
    private ApplicationExternalService externalService;
    
    @Autowired
    private AuthExternalService authExternalService;
    
    /**
     * Helper method to get user ID from authenticated user
     */
    private String getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        var userDto = authExternalService.getUserByEmail(userDetails.getUsername());
        return userDto != null ? userDto.getId() : null;
    }
    
    @Operation(
        summary = "Create application",
        description = "Submit a new job application with CV (required) and Cover Letter (optional). " +
                      "Allowed file types: PDF, DOC, DOCX. Maximum file size: 10MB per file."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Application created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data, CV file missing, or invalid file type"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "409", description = "Application already exists for this job post")
    })
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createApplication(
            @Parameter(description = "Job post ID (required)")
            @RequestParam("jobPostId") String jobPostId,
            @Parameter(description = "Job title (optional, cached from job post)")
            @RequestParam(value = "jobTitle", required = false) String jobTitle,
            @Parameter(description = "Company name (optional, cached from job post)")
            @RequestParam(value = "companyName", required = false) String companyName,
            @Parameter(description = "CV file (required). Allowed types: PDF, DOC, DOCX. Max size: 10MB")
            @RequestParam("cv") MultipartFile cvFile,
            @Parameter(description = "Cover Letter file (optional). Allowed types: PDF, DOC, DOCX. Max size: 10MB")
            @RequestParam(value = "coverLetter", required = false) MultipartFile coverLetterFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String applicantId = getUserIdFromUserDetails(userDetails);
            if (applicantId == null) {
                return new ResponseEntity<>(Map.of("error", "User not found"), HttpStatus.UNAUTHORIZED);
            }
            
            // Build request from params
            CreateApplicationRequest request = new CreateApplicationRequest();
            request.setJobPostId(jobPostId);
            request.setJobTitle(jobTitle);
            request.setCompanyName(companyName);
            
            ApplicationResponse response = internalService.createApplication(
                applicantId, request, cvFile, coverLetterFile);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.err.println("Error creating application: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create application: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get user applications",
        description = "Retrieve all applications submitted by the authenticated user. Optionally filter by status."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Applications retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status filter"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(
            @Parameter(description = "Optional status filter (PENDING, REVIEWING, ACCEPTED, REJECTED, WITHDRAWN)")
            @RequestParam(value = "status", required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String applicantId = getUserIdFromUserDetails(userDetails);
            if (applicantId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // Parse status filter if provided
            Application.ApplicationStatus statusFilter = null;
            if (status != null && !status.isEmpty()) {
                try {
                    statusFilter = Application.ApplicationStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Invalid status: " + status + ". Valid values: PENDING, REVIEWING, ACCEPTED, REJECTED, WITHDRAWN");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }
            }
            
            ApplicationListResponse response = internalService.getUserApplications(applicantId, statusFilter);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching applications: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch applications");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get application by ID",
        description = "Retrieve a specific application by ID (only if it belongs to the authenticated user)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplication(
            @Parameter(description = "Application ID")
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String applicantId = getUserIdFromUserDetails(userDetails);
            if (applicantId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            ApplicationResponse response = internalService.getUserApplication(id, applicantId);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            Map<String, String> error = new HashMap<>();
            error.put("error", "Application not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            System.err.println("Error fetching application: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch application");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Get applications by job post ID",
        description = "Retrieve all applications for a specific job post. Used by job posting system."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    })
    @GetMapping("/job/{jobPostId}")
    public ResponseEntity<?> getApplicationsByJobPostId(
            @Parameter(description = "Job post ID")
            @PathVariable String jobPostId) {
        try {
            List<ApplicationResponse> applications = externalService.getApplicationsByJobPostId(jobPostId);
            return new ResponseEntity<>(applications, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching applications by job post: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch applications");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Withdraw application",
        description = "Withdraw an application (change status to WITHDRAWN)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application withdrawn successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<?> withdrawApplication(
            @Parameter(description = "Application ID to withdraw")
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String applicantId = getUserIdFromUserDetails(userDetails);
            if (applicantId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            ApplicationResponse response = internalService.withdrawApplication(id, applicantId);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            Map<String, String> error = new HashMap<>();
            error.put("error", "Application not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            System.err.println("Error withdrawing application: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to withdraw application");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @Operation(
        summary = "Delete application",
        description = "Delete an application. This will also delete associated files from storage."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteApplication(
            @Parameter(description = "Application ID to delete")
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String applicantId = getUserIdFromUserDetails(userDetails);
            if (applicantId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            boolean deleted = internalService.deleteApplication(id, applicantId);
            Map<String, String> response = new HashMap<>();
            
            if (deleted) {
                response.put("message", "Application deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Application not found or unauthorized");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error deleting application: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete application");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

