package com.DEVision.JobApplicant.applicant.internal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.entity.Education;
import com.DEVision.JobApplicant.applicant.entity.WorkExperience;
import com.DEVision.JobApplicant.applicant.internal.dto.AddEducationRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddSkillRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddSkillsRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddWorkExperienceRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.EducationResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.ProfileResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateEducationRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateProfileRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateWorkExperienceRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.WorkExperienceResponse;
import com.DEVision.JobApplicant.applicant.service.ApplicantService;

import java.util.List;
import java.util.stream.Collectors;

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

    // Education operations
    public EducationResponse addEducation(String applicantId, AddEducationRequest request) {
        validateOwnership(applicantId);
        
        Education education = new Education();
        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartDate(request.getStartDate());
        education.setEndDate(request.getEndDate());
        education.setDescription(request.getDescription());
        education.setCurrent(request.isCurrent());
        
        Applicant updated = applicantService.addEducation(applicantId, education);
        
        if (updated == null) {
            return null;
        }
        
        // Find the newly added education
        Education added = updated.getEducation().get(updated.getEducation().size() - 1);
        return toEducationResponse(added);
    }
    
    public EducationResponse updateEducation(String applicantId, String educationId, UpdateEducationRequest request) {
        validateOwnership(applicantId);
        
        Education education = new Education();
        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartDate(request.getStartDate());
        education.setEndDate(request.getEndDate());
        education.setDescription(request.getDescription());
        education.setCurrent(request.isCurrent());
        
        Applicant updated = applicantService.updateEducation(applicantId, educationId, education);
        
        if (updated == null) {
            return null;
        }
        
        // Find the updated education
        return updated.getEducation().stream()
                .filter(edu -> edu.getId().toString().equals(educationId))
                .map(this::toEducationResponse)
                .findFirst()
                .orElse(null);
    }
    
    public boolean deleteEducation(String applicantId, String educationId) {
        validateOwnership(applicantId);
        return applicantService.deleteEducation(applicantId, educationId) != null;
    }
    
    // Work Experience operations
    public WorkExperienceResponse addWorkExperience(String applicantId, AddWorkExperienceRequest request) {
        validateOwnership(applicantId);
        
        WorkExperience workExperience = new WorkExperience();
        workExperience.setCompany(request.getCompany());
        workExperience.setPosition(request.getPosition());
        workExperience.setDescription(request.getDescription());
        workExperience.setStartDate(request.getStartDate());
        workExperience.setEndDate(request.getEndDate());
        workExperience.setCurrent(request.isCurrent());
        
        Applicant updated = applicantService.addWorkExperience(applicantId, workExperience);
        
        if (updated == null) {
            return null;
        }
        
        // Find the newly added work experience
        WorkExperience added = updated.getWorkExperience().get(updated.getWorkExperience().size() - 1);
        return toWorkExperienceResponse(added);
    }
    
    public WorkExperienceResponse updateWorkExperience(String applicantId, String workExperienceId, 
                                                       UpdateWorkExperienceRequest request) {
        validateOwnership(applicantId);
        
        WorkExperience workExperience = new WorkExperience();
        workExperience.setCompany(request.getCompany());
        workExperience.setPosition(request.getPosition());
        workExperience.setDescription(request.getDescription());
        workExperience.setStartDate(request.getStartDate());
        workExperience.setEndDate(request.getEndDate());
        workExperience.setCurrent(request.isCurrent());
        
        Applicant updated = applicantService.updateWorkExperience(applicantId, workExperienceId, workExperience);
        
        if (updated == null) {
            return null;
        }
        
        // Find the updated work experience
        return updated.getWorkExperience().stream()
                .filter(exp -> exp.getId().toString().equals(workExperienceId))
                .map(this::toWorkExperienceResponse)
                .findFirst()
                .orElse(null);
    }
    
    public boolean deleteWorkExperience(String applicantId, String workExperienceId) {
        validateOwnership(applicantId);
        return applicantService.deleteWorkExperience(applicantId, workExperienceId) != null;
    }
    
    // Skills operations
    public ProfileResponse addSkill(String applicantId, AddSkillRequest request) {
        validateOwnership(applicantId);
        Applicant updated = applicantService.addSkill(applicantId, request.getSkill());
        return updated != null ? toProfileResponse(updated) : null;
    }
    
    public ProfileResponse addSkills(String applicantId, AddSkillsRequest request) {
        validateOwnership(applicantId);
        Applicant updated = applicantService.addSkills(applicantId, request.getSkills());
        return updated != null ? toProfileResponse(updated) : null;
    }
    
    public ProfileResponse deleteSkill(String applicantId, String skill) {
        validateOwnership(applicantId);
        Applicant updated = applicantService.deleteSkill(applicantId, skill);
        return updated != null ? toProfileResponse(updated) : null;
    }
    
    // Avatar upload
    public ProfileResponse uploadAvatar(String applicantId, MultipartFile file) {
        validateOwnership(applicantId);
        Applicant updated = applicantService.uploadAvatar(applicantId, file);
        return updated != null ? toProfileResponse(updated) : null;
    }
    
    // Validation helper
    private void validateOwnership(String applicantId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }
        
        String authenticatedUserId = authentication.getName();
        Applicant applicant = applicantService.getApplicantById(applicantId);
        
        if (applicant == null) {
            throw new IllegalArgumentException("Applicant not found");
        }
        
        if (!applicant.getUserId().equals(authenticatedUserId)) {
            throw new SecurityException("You can only modify your own profile");
        }
    }
    
    // Convert entity to profile response DTO
    private ProfileResponse toProfileResponse(Applicant applicant) {
        List<EducationResponse> educationResponses = applicant.getEducation() != null 
            ? applicant.getEducation().stream()
                .map(this::toEducationResponse)
                .collect(Collectors.toList())
            : List.of();
        
        List<WorkExperienceResponse> workExperienceResponses = applicant.getWorkExperience() != null
            ? applicant.getWorkExperience().stream()
                .map(this::toWorkExperienceResponse)
                .collect(Collectors.toList())
            : List.of();
        
        List<String> skills = applicant.getSkills() != null 
            ? applicant.getSkills() 
            : List.of();
        
        return new ProfileResponse(
            applicant.getId(),
            applicant.getUserId(),
            applicant.getFirstName(),
            applicant.getLastName(),
            applicant.getCountry(),
            applicant.getPhoneNumber(),
            applicant.getAddress(),
            applicant.getCity(),
            educationResponses,
            workExperienceResponses,
            skills,
            applicant.getAvatarUrl(),
            applicant.getCreatedAt(),
            applicant.getUpdatedAt()
        );
    }
    
    private EducationResponse toEducationResponse(Education education) {
        return new EducationResponse(
            education.getId().toString(),
            education.getInstitution(),
            education.getDegree(),
            education.getFieldOfStudy(),
            education.getStartDate(),
            education.getEndDate(),
            education.getDescription(),
            education.isCurrent()
        );
    }
    
    private WorkExperienceResponse toWorkExperienceResponse(WorkExperience workExperience) {
        return new WorkExperienceResponse(
            workExperience.getId().toString(),
            workExperience.getCompany(),
            workExperience.getPosition(),
            workExperience.getDescription(),
            workExperience.getStartDate(),
            workExperience.getEndDate(),
            workExperience.isCurrent()
        );
    }
}
