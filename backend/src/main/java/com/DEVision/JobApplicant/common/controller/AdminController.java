package com.DEVision.JobApplicant.common.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.repository.ApplicantRepository;
import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.common.config.RoleConfig;

/**
 * Admin Controller
 * Provides admin-specific endpoints for managing applicants
 * 
 * Requirements 6.1.2, 6.2.1: View, search, and deactivate applicants
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    /**
     * Get dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalApplicants = applicantRepository.count();
        long totalUsers = authRepository.count();
        long premiumCount = authRepository.findAll().stream()
            .filter(u -> u.getPlanType() != null && u.getPlanType().name().equals("PREMIUM"))
            .count();
        long activeUsers = authRepository.findAll().stream()
            .filter(User::isEnabled)
            .count();
        
        stats.put("totalApplicants", totalApplicants);
        stats.put("totalCompanies", 0); // Companies are managed by Job Manager
        stats.put("totalJobPosts", 0);  // Job posts are managed by Job Manager
        stats.put("activeUsers", activeUsers);
        stats.put("premiumApplicants", premiumCount);
        stats.put("premiumCompanies", 0);
        
        return ResponseEntity.ok(stats);
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
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        List<Applicant> allApplicants = applicantRepository.findAll();
        
        // Filter by search term
        List<Applicant> filtered = allApplicants;
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            filtered = allApplicants.stream()
                .filter(a -> {
                    String fullName = (a.getFirstName() != null ? a.getFirstName() : "") + " " + 
                                     (a.getLastName() != null ? a.getLastName() : "");
                    return fullName.toLowerCase().contains(searchLower);
                })
                .collect(Collectors.toList());
        }
        
        // Get user info for each applicant
        List<Map<String, Object>> applicantsWithStatus = filtered.stream()
            .skip((long) (page - 1) * limit)
            .limit(limit)
            .map(a -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", a.getId());
                dto.put("name", (a.getFirstName() != null ? a.getFirstName() : "") + " " + 
                               (a.getLastName() != null ? a.getLastName() : ""));
                dto.put("country", a.getCountry() != null ? a.getCountry().getDisplayName() : "");
                dto.put("city", a.getCity() != null ? a.getCity() : "");
                dto.put("skills", a.getSkills());
                dto.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");
                
                // Get user info
                User user = authRepository.findById(a.getUserId()).orElse(null);
                if (user != null) {
                    dto.put("email", user.getEmail());
                    dto.put("status", user.isEnabled() ? "active" : "inactive");
                    dto.put("isPremium", user.getPlanType() != null && 
                                        user.getPlanType().name().equals("PREMIUM"));
                } else {
                    dto.put("email", "");
                    dto.put("status", "unknown");
                    dto.put("isPremium", false);
                }
                
                return dto;
            })
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", applicantsWithStatus);
        response.put("total", filtered.size());
        response.put("page", page);
        response.put("limit", limit);
        response.put("totalPages", (int) Math.ceil((double) filtered.size() / limit));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Deactivate an applicant account
     */
    @PutMapping("/applicants/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateApplicant(@PathVariable String id) {
        Applicant applicant = applicantRepository.findById(id).orElse(null);
        
        if (applicant == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Applicant not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        // Deactivate the user account
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        if (user != null) {
            user.setEnabled(false);
            authRepository.save(user);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Applicant deactivated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get single applicant by ID
     */
    @GetMapping("/applicants/{id}")
    public ResponseEntity<?> getApplicant(@PathVariable String id) {
        Applicant applicant = applicantRepository.findById(id).orElse(null);
        
        if (applicant == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Applicant not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", applicant.getId());
        dto.put("firstName", applicant.getFirstName());
        dto.put("lastName", applicant.getLastName());
        dto.put("country", applicant.getCountry() != null ? applicant.getCountry().getDisplayName() : "");
        dto.put("city", applicant.getCity());
        dto.put("address", applicant.getAddress());
        dto.put("phoneNumber", applicant.getPhoneNumber());
        dto.put("skills", applicant.getSkills());
        dto.put("education", applicant.getEducation());
        dto.put("workExperience", applicant.getWorkExperience());
        dto.put("objectiveSummary", applicant.getObjectiveSummary());
        dto.put("createdAt", applicant.getCreatedAt() != null ? applicant.getCreatedAt().toString() : "");
        
        if (user != null) {
            dto.put("email", user.getEmail());
            dto.put("status", user.isEnabled() ? "active" : "inactive");
            dto.put("isPremium", user.getPlanType() != null && 
                                user.getPlanType().name().equals("PREMIUM"));
        }
        
        return ResponseEntity.ok(dto);
    }
}
