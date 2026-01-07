package com.DEVision.JobApplicant.admin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.DEVision.JobApplicant.admin.dto.*;
import com.DEVision.JobApplicant.admin.service.AdminService;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin Controller
 * Provides admin-specific endpoints for managing applicants and companies
 *
 * Requirements 6.1.2, 6.2.1: View, search, and deactivate applicants/companies
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get dashboard statistics
     *
     * Stats are calculated for APPLICANT role users only (not admin accounts)
     * according to requirement 6.1.2 which manages Job Applicant accounts
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        AdminStatsDto stats = adminService.getDashboardStats();

        // Convert to Map for frontend compatibility
        Map<String, Object> response = new HashMap<>();
        response.put("totalApplicants", stats.getTotalApplicants());
        response.put("totalCompanies", stats.getTotalCompanies());
        response.put("totalJobPosts", stats.getTotalJobPosts());
        response.put("activeUsers", stats.getActiveUsers());
        response.put("premiumApplicants", stats.getPremiumApplicants());
        response.put("premiumCompanies", stats.getPremiumCompanies());

        return ResponseEntity.ok(response);
    }

    /**
     * Get list of applicants with pagination and search
     */
    @GetMapping("/applicants")
    public ResponseEntity<Map<String, Object>> getApplicants(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "") String search
    ) {
        ApplicantListResponseDto response = adminService.getApplicants(page, limit, search);

        // Convert to Map for frontend compatibility
        Map<String, Object> result = new HashMap<>();
        result.put("data", response.getData());
        result.put("total", response.getTotal());
        result.put("page", response.getPage());
        result.put("limit", response.getLimit());
        result.put("totalPages", response.getTotalPages());

        return ResponseEntity.ok(result);
    }

    /**
     * Get single applicant by ID
     */
    @GetMapping("/applicants/{id}")
    public ResponseEntity<?> getApplicant(@PathVariable String id) {
        try {
            ApplicantDetailDto applicant = adminService.getApplicantById(id);

            // Convert to Map for frontend compatibility
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", applicant.getId());
            dto.put("firstName", applicant.getFirstName());
            dto.put("lastName", applicant.getLastName());
            dto.put("country", applicant.getCountry());
            dto.put("city", applicant.getCity());
            dto.put("address", applicant.getAddress());
            dto.put("phoneNumber", applicant.getPhoneNumber());
            dto.put("skills", applicant.getSkills());
            dto.put("education", applicant.getEducation());
            dto.put("workExperience", applicant.getWorkExperience());
            dto.put("objectiveSummary", applicant.getObjectiveSummary());
            dto.put("createdAt", applicant.getCreatedAt());
            dto.put("email", applicant.getEmail());
            dto.put("status", applicant.getStatus());
            dto.put("isPremium", applicant.getIsPremium());

            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Deactivate an applicant account
     */
    @PutMapping("/applicants/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateApplicant(@PathVariable String id) {
        try {
            String message = adminService.deactivateApplicant(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Deactivate a company account in JM system
     */
    @PutMapping("/companies/{accountId}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateCompany(@PathVariable String accountId) {
        try {
            String message = adminService.deactivateCompany(accountId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Activate a company account in JM system
     */
    @PutMapping("/companies/{accountId}/activate")
    public ResponseEntity<Map<String, Object>> activateCompany(@PathVariable String accountId) {
        try {
            String message = adminService.activateCompany(accountId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
