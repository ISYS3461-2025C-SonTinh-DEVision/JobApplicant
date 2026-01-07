package com.DEVision.JobApplicant.admin.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.admin.dto.*;
import com.DEVision.JobApplicant.admin.service.AdminService;
import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.repository.ApplicantRepository;
import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.common.config.RoleConfig;
import com.DEVision.JobApplicant.jobManager.company.external.dto.AccountActionResponse;
import com.DEVision.JobApplicant.jobManager.company.service.CallCompanyService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of AdminService
 * Extracted business logic from AdminController
 */
@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private CallCompanyService callCompanyService;

    @Override
    public AdminStatsDto getDashboardStats() {
        // Count only applicants (not admin or company users)
        long totalApplicants = applicantRepository.count();

        // Get all users with APPLICANT role for accurate stats
        List<User> applicantUsers = authRepository.findAll().stream()
            .filter(u -> RoleConfig.APPLICANT.getRoleName().equals(u.getRole()))
            .collect(Collectors.toList());

        // Premium count - only APPLICANT role users
        long premiumCount = applicantUsers.stream()
            .filter(u -> u.getPlanType() != null && u.getPlanType().name().equals("PREMIUM"))
            .count();

        // Active users - only APPLICANT role users that are enabled
        long activeApplicants = applicantUsers.stream()
            .filter(User::isEnabled)
            .count();

        return new AdminStatsDto(
            totalApplicants,
            0L,  // Companies are managed by Job Manager
            0L,  // Job posts are managed by Job Manager
            activeApplicants,
            premiumCount,
            0L   // Premium companies managed by Job Manager
        );
    }

    @Override
    public ApplicantListResponseDto getApplicants(int page, int limit, String search) {
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
        List<ApplicantListItemDto> applicantsWithStatus = filtered.stream()
            .skip((long) (page - 1) * limit)
            .limit(limit)
            .map(this::mapToListItemDto)
            .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) filtered.size() / limit);

        return new ApplicantListResponseDto(
            applicantsWithStatus,
            filtered.size(),
            page,
            limit,
            totalPages
        );
    }

    @Override
    public ApplicantDetailDto getApplicantById(String id) {
        Applicant applicant = applicantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Applicant not found"));

        User user = authRepository.findById(applicant.getUserId()).orElse(null);

        return mapToDetailDto(applicant, user);
    }

    @Override
    public String deactivateApplicant(String id) {
        Applicant applicant = applicantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Applicant not found"));

        // Deactivate the user account
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        if (user != null) {
            user.setEnabled(false);
            authRepository.save(user);
        }

        return "Applicant deactivated successfully";
    }

    @Override
    public String deactivateCompany(String accountId) {
        AccountActionResponse response = callCompanyService.deactivateAccount(accountId);

        if (response.getSuccess() != null && response.getSuccess()) {
            return "Company account deactivated successfully";
        } else {
            throw new RuntimeException(
                "Failed to deactivate company: " +
                (response.getMessage() != null ? response.getMessage() : "Unknown error")
            );
        }
    }

    @Override
    public String activateCompany(String accountId) {
        AccountActionResponse response = callCompanyService.activateAccount(accountId);

        if (response.getSuccess() != null && response.getSuccess()) {
            return "Company account activated successfully";
        } else {
            throw new RuntimeException(
                "Failed to activate company: " +
                (response.getMessage() != null ? response.getMessage() : "Unknown error")
            );
        }
    }

    /**
     * Map Applicant entity to ApplicantListItemDto
     */
    private ApplicantListItemDto mapToListItemDto(Applicant applicant) {
        ApplicantListItemDto dto = new ApplicantListItemDto();
        dto.setId(applicant.getId());
        dto.setName((applicant.getFirstName() != null ? applicant.getFirstName() : "") + " " +
                   (applicant.getLastName() != null ? applicant.getLastName() : ""));
        dto.setCountry(applicant.getCountry() != null ? applicant.getCountry().getDisplayName() : "");
        dto.setCity(applicant.getCity() != null ? applicant.getCity() : "");
        dto.setSkills(applicant.getSkills());
        dto.setCreatedAt(applicant.getCreatedAt() != null ? applicant.getCreatedAt().toString() : "");

        // Get user info
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        if (user != null) {
            dto.setEmail(user.getEmail());
            dto.setStatus(user.isEnabled() ? "active" : "inactive");
            dto.setIsPremium(user.getPlanType() != null &&
                           user.getPlanType().name().equals("PREMIUM"));
        } else {
            dto.setEmail("");
            dto.setStatus("unknown");
            dto.setIsPremium(false);
        }

        return dto;
    }

    /**
     * Map Applicant entity to ApplicantDetailDto
     */
    private ApplicantDetailDto mapToDetailDto(Applicant applicant, User user) {
        ApplicantDetailDto dto = new ApplicantDetailDto();
        dto.setId(applicant.getId());
        dto.setFirstName(applicant.getFirstName());
        dto.setLastName(applicant.getLastName());
        dto.setCountry(applicant.getCountry() != null ? applicant.getCountry().getDisplayName() : "");
        dto.setCity(applicant.getCity());
        dto.setAddress(applicant.getAddress());
        dto.setPhoneNumber(applicant.getPhoneNumber());
        dto.setSkills(applicant.getSkills());
        dto.setEducation(applicant.getEducation());
        dto.setWorkExperience(applicant.getWorkExperience());
        dto.setObjectiveSummary(applicant.getObjectiveSummary());
        dto.setCreatedAt(applicant.getCreatedAt() != null ? applicant.getCreatedAt().toString() : "");

        if (user != null) {
            dto.setEmail(user.getEmail());
            dto.setStatus(user.isEnabled() ? "active" : "inactive");
            dto.setIsPremium(user.getPlanType() != null &&
                           user.getPlanType().name().equals("PREMIUM"));
        }

        return dto;
    }
}
