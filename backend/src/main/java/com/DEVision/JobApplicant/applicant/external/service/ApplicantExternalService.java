package com.DEVision.JobApplicant.applicant.external.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.external.dto.ApplicantDto;
import com.DEVision.JobApplicant.applicant.external.dto.CreateApplicantRequest;
import com.DEVision.JobApplicant.applicant.service.ApplicantService;

/**
 * External service for other backend modules to interact with applicants
 * Main purpose: Other modules (like auth) call this to manage applicant data
 */
@Service
public class ApplicantExternalService {

    @Autowired
    private ApplicantService applicantService;

    /**
     * PRIMARY METHOD: Create applicant profile
     * Called by auth module during user registration
     */
    public ApplicantDto createApplicant(CreateApplicantRequest request) {
        Applicant applicant = new Applicant();
        applicant.setUserId(request.getUserId());
        applicant.setCountry(request.getCountry());
        applicant.setFirstName(request.getFirstName());
        applicant.setLastName(request.getLastName());
        applicant.setPhoneNumber(request.getPhoneNumber());
        applicant.setAddress(request.getAddress());
        applicant.setCity(request.getCity());

        Applicant saved = applicantService.createApplicant(applicant);
        return toDto(saved);
    }

    /**
     * Get applicant by user ID
     * Used by other modules to fetch applicant data
     */
    public ApplicantDto getApplicantByUserId(String userId) {
        Applicant applicant = applicantService.getApplicantByUserId(userId);
        return applicant != null ? toDto(applicant) : null;
    }

    /**
     * Get applicant by ID
     */
    public ApplicantDto getApplicantById(String id) {
        Applicant applicant = applicantService.getApplicantById(id);
        return applicant != null ? toDto(applicant) : null;
    }

    /**
     * Check if applicant exists for user
     */
    public boolean existsByUserId(String userId) {
        return applicantService.getApplicantByUserId(userId) != null;
    }

    /**
     * Delete applicant by user ID
     * Used when user account is deleted
     */
    public boolean deleteByUserId(String userId) {
        Applicant applicant = applicantService.getApplicantByUserId(userId);
        if (applicant != null) {
            return applicantService.deleteApplicant(applicant.getId());
        }
        return false;
    }

    // Convert entity to DTO
    private ApplicantDto toDto(Applicant applicant) {
        return new ApplicantDto(
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
