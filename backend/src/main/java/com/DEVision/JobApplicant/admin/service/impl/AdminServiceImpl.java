package com.DEVision.JobApplicant.admin.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.DEVision.JobApplicant.jobManager.company.external.dto.CompanyListResponse;
import com.DEVision.JobApplicant.jobManager.company.service.CallCompanyService;
import com.DEVision.JobApplicant.jobManager.jobpost.service.CallJobPostService;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostListResponse;
import com.DEVision.JobApplicant.notification.service.WebSocketNotificationService;
import com.DEVision.JobApplicant.subscription.entity.Subscription;
import com.DEVision.JobApplicant.subscription.enums.PlanType;
import com.DEVision.JobApplicant.subscription.enums.SubscriptionStatus;
import com.DEVision.JobApplicant.subscription.repository.SubscriptionRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of AdminService
 * Extracted business logic from AdminController
 */
@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private CallCompanyService callCompanyService;

    @Autowired
    private CallJobPostService callJobPostService;

    @Autowired
    private SubscriptionRepository subscriptionRepository;
    
    @Autowired
    private WebSocketNotificationService webSocketNotificationService;

    @Override
    public AdminStatsDto getDashboardStats() {
        // Count only applicants (not admin or company users)
        long totalApplicants = applicantRepository.count();

        // Get all users with APPLICANT role for accurate stats
        List<User> applicantUsers = authRepository.findAll().stream()
            .filter(u -> RoleConfig.APPLICANT.getRoleName().equals(u.getRole()))
            .collect(Collectors.toList());

        // Premium count - check from subscriptions (PREMIUM and ACTIVE status)
        long premiumCount = subscriptionRepository.findAll().stream()
            .filter(s -> s.getPlanType() == PlanType.PREMIUM && s.getStatus() == SubscriptionStatus.ACTIVE)
            .count();

        // Active users - only APPLICANT role users that are enabled
        long activeApplicants = applicantUsers.stream()
            .filter(User::isEnabled)
            .count();

        // Fetch real counts from Job Manager API
        long totalCompanies = 0L;
        long totalJobPosts = 0L;
        long premiumCompanies = 0L;

        try {
            // Get company count from JM API
            Map<String, Object> companyParams = new HashMap<>();
            companyParams.put("page", 1);
            companyParams.put("limit", 1); // Just need total count
            CompanyListResponse companyResponse = callCompanyService.searchCompanies(companyParams);
            if (companyResponse != null) {
                totalCompanies = companyResponse.getTotalCount() != null ? companyResponse.getTotalCount() : 0L;
                // Note: Premium company count not available in current JM API response
            }
            logger.debug("Fetched company count from JM: {}", totalCompanies);
        } catch (Exception e) {
            logger.warn("Failed to fetch company count from JM: {}", e.getMessage());
        }

        try {
            // Get ACTIVE job posts count from JM API
            // Fetch jobs list and count only those with isActive=true
            Map<String, Object> jobParams = new HashMap<>();
            jobParams.put("page", 1);
            jobParams.put("size", 100); // Fetch enough to count active jobs
            JobPostListResponse jobResponse = callJobPostService.searchJobPosts(jobParams);
            if (jobResponse != null && jobResponse.getJobs() != null) {
                // Count only active job posts
                totalJobPosts = jobResponse.getJobs().stream()
                    .filter(job -> Boolean.TRUE.equals(job.getIsActive()))
                    .count();
            }
            logger.debug("Fetched active job post count from JM: {}", totalJobPosts);
        } catch (Exception e) {
            logger.warn("Failed to fetch job post count from JM: {}", e.getMessage());
        }

        return new AdminStatsDto(
            totalApplicants,
            totalCompanies,
            totalJobPosts,
            activeApplicants,
            premiumCount,
            premiumCompanies
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

        // Get the user account
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        if (user != null) {
            // Send WebSocket notification BEFORE deactivating (so user receives it)
            try {
                webSocketNotificationService.sendAccountDeactivatedAlert(
                    user.getId(),
                    "Your account has been deactivated by an administrator. Please contact support if you believe this is an error."
                );
                logger.info("Sent deactivation alert to user: {}", user.getId());
            } catch (Exception e) {
                logger.warn("Failed to send WebSocket notification to user {}: {}", user.getId(), e.getMessage());
            }
            
            // Deactivate the user account
            user.setEnabled(false);
            authRepository.save(user);
        }

        return "Applicant deactivated successfully";
    }

    @Override
    public String activateApplicant(String id) {
        Applicant applicant = applicantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Applicant not found"));

        // Activate the user account
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        if (user != null) {
            user.setEnabled(true);
            authRepository.save(user);
        } else {
            throw new RuntimeException("User account not found for applicant");
        }

        return "Applicant activated successfully";
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
        dto.setCity(applicant.getCity() != null ? applicant.getCity() : "");
        dto.setSkills(applicant.getSkills());
        dto.setCreatedAt(applicant.getCreatedAt() != null ? applicant.getCreatedAt().toString() : "");

        // Get user info (country is now in User)
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        if (user != null) {
            dto.setEmail(user.getEmail());
            dto.setStatus(user.isEnabled() ? "active" : "inactive");
            dto.setCountry(user.getCountry() != null ? user.getCountry().getDisplayName() : "");
            
            // Check premium status from subscription
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findByUserId(applicant.getUserId());
            dto.setIsPremium(subscriptionOpt.isPresent() 
                && subscriptionOpt.get().getPlanType() == PlanType.PREMIUM
                && subscriptionOpt.get().getStatus() == SubscriptionStatus.ACTIVE);
        } else {
            dto.setEmail("");
            dto.setStatus("unknown");
            dto.setIsPremium(false);
            dto.setCountry("");
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
        dto.setCountry(user != null && user.getCountry() != null ? user.getCountry().getDisplayName() : "");
        dto.setCity(applicant.getCity());
        dto.setAddress(applicant.getAddress());
        dto.setPhoneNumber(applicant.getPhoneNumber());
        dto.setSkills(applicant.getSkills());
        // Convert list to string representation for display
        dto.setEducation(applicant.getEducation() != null ? applicant.getEducation().toString() : "");
        dto.setWorkExperience(applicant.getWorkExperience() != null ? applicant.getWorkExperience().toString() : "");
        dto.setObjectiveSummary(applicant.getObjectiveSummary());
        dto.setCreatedAt(applicant.getCreatedAt() != null ? applicant.getCreatedAt().toString() : "");

        if (user != null) {
            dto.setEmail(user.getEmail());
            dto.setStatus(user.isEnabled() ? "active" : "inactive");
            
            // Check premium status from subscription
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findByUserId(user.getId());
            dto.setIsPremium(subscriptionOpt.isPresent() 
                && subscriptionOpt.get().getPlanType() == PlanType.PREMIUM
                && subscriptionOpt.get().getStatus() == SubscriptionStatus.ACTIVE);
        }

        return dto;
    }
}
