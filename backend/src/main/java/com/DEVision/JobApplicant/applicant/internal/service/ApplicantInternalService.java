package com.DEVision.JobApplicant.applicant.internal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.internal.dto.ProfileResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateProfileRequest;
import com.DEVision.JobApplicant.applicant.service.ApplicantService;

/**
 * Internal service for applicant module's own business logic
 * Handles profile management operations
 */
@Service
public class ApplicantInternalService {

    @Autowired
    private ApplicantService applicantService;

    /**
     * Get user profile by user ID
     */
    public ProfileResponse getProfile(String userId) {
        Applicant applicant = applicantService.getApplicantByUserId(userId);
        return applicant != null ? toProfileResponse(applicant) : null;
    }

    /**
     * Get profile by applicant ID
     */
    public ProfileResponse getProfileById(String id) {
        Applicant applicant = applicantService.getApplicantById(id);
        return applicant != null ? toProfileResponse(applicant) : null;
    }

    /**
     * Update user profile
     */
    public ProfileResponse updateProfile(String id, UpdateProfileRequest request) {
        Applicant updatedApplicant = new Applicant();
        updatedApplicant.setFirstName(request.getFirstName());
        updatedApplicant.setLastName(request.getLastName());
        updatedApplicant.setCountry(request.getCountry());
        updatedApplicant.setPhoneNumber(request.getPhoneNumber());
        updatedApplicant.setAddress(request.getAddress());
        updatedApplicant.setCity(request.getCity());

        Applicant updated = applicantService.updateApplicant(id, updatedApplicant);
        return updated != null ? toProfileResponse(updated) : null;
    }

    /**
     * Delete profile
     */
    public boolean deleteProfile(String id) {
        return applicantService.deleteApplicant(id);
    }

    // Convert entity to profile response DTO
    private ProfileResponse toProfileResponse(Applicant applicant) {
        return new ProfileResponse(
            applicant.getId(),
            applicant.getUserId(),
            applicant.getFirstName(),
            applicant.getLastName(),
            applicant.getCountry(),
            applicant.getPhoneNumber(),
            applicant.getAddress(),
            applicant.getCity(),
            applicant.getCreatedAt(),
            applicant.getUpdatedAt()
        );
    }
}
