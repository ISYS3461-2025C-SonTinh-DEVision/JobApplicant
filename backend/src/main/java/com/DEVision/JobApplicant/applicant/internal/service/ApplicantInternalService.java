package com.DEVision.JobApplicant.applicant.internal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.entity.Education;
import com.DEVision.JobApplicant.applicant.entity.PortfolioItem;
import com.DEVision.JobApplicant.applicant.entity.WorkExperience;
import com.DEVision.JobApplicant.applicant.internal.dto.AddEducationRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddSkillRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddSkillsRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddWorkExperienceRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.ApplicantListItemResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.ApplicantSearchResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.EducationResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.PortfolioItemResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.PortfolioResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.ProfileResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateEducationRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateProfileRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateWorkExperienceRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.WorkExperienceResponse;
import com.DEVision.JobApplicant.applicant.service.ApplicantService;
import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.common.country.model.Country;
import com.DEVision.JobApplicant.common.model.PlanType;

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

    @Autowired
    private AuthRepository authRepository;

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
     * Search applicants with pagination and filters
     * @param keyword Search keyword for firstName, lastName, or city
     * @param country Filter by country (can be country code or enum name)
     * @param skill Filter by technical skill
     * @param page Page number (0-based)
     * @param size Page size (default: 10, max: 100)
     * @param sortBy Field to sort by (default: createdAt)
     * @param sortDirection Sort direction (asc or desc, default: desc)
     * @return Paginated response with applicants
     */
    public ApplicantSearchResponse searchApplicants(String keyword, String country, String skill,
                                                    int page, int size, String sortBy, String sortDirection) {
        // Validate and sanitize page size
        if (size < 1) size = 10;
        if (size > 100) size = 100;
        if (page < 0) page = 0;
        
        // Default sort values
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "createdAt";
        }
        if (sortDirection == null || sortDirection.trim().isEmpty()) {
            sortDirection = "desc";
        }
        
        // Parse country if provided
        Country countryEnum = null;
        if (country != null && !country.trim().isEmpty()) {
            countryEnum = Country.fromCode(country.trim());
        }
        
        // Call service method
        Page<Applicant> applicantsPage = applicantService.searchApplicants(
            keyword, countryEnum, skill, page, size, sortBy, sortDirection
        );
        
        // Convert to ApplicantListItemResponse list (excludes userId)
        List<ApplicantListItemResponse> applicantListItems = applicantsPage.getContent().stream()
            .map(applicant -> toApplicantListItemResponse(applicant))
            .collect(Collectors.toList());
        
        return new ApplicantSearchResponse(
            applicantListItems,
            applicantsPage.getNumber(),
            applicantsPage.getSize(),
            applicantsPage.getTotalElements(),
            applicantsPage.getTotalPages()
        );
    }

    /**
     * Update user profile
     */
    public ProfileResponse updateProfile(String id, UpdateProfileRequest request) {
        Applicant updatedApplicant = new Applicant();
        updatedApplicant.setFirstName(request.getFirstName());
        updatedApplicant.setLastName(request.getLastName());

        updatedApplicant.setPhoneNumber(request.getPhoneNumber());
        updatedApplicant.setAddress(request.getAddress());
        updatedApplicant.setCity(request.getCity());
        updatedApplicant.setObjectiveSummary(request.getObjectiveSummary());

        Applicant updated = applicantService.updateApplicant(id, updatedApplicant);
        
        // Update country in User if provided
        if (request.getCountry() != null && updated != null) {
            applicantService.updateUserCountry(updated.getUserId(), request.getCountry());
        }
        
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
    
    // /api/me operations - use authenticated user from JWT token
    public ProfileResponse getMyProfile() {
        Applicant applicant = getMyApplicant();
        return toProfileResponse(applicant);
    }

    public ProfileResponse updateMyProfile(UpdateProfileRequest request) {
        Applicant applicant = getMyApplicant();
        Applicant updatedApplicant = new Applicant();
        updatedApplicant.setFirstName(request.getFirstName());
        updatedApplicant.setLastName(request.getLastName());

        updatedApplicant.setPhoneNumber(request.getPhoneNumber());
        updatedApplicant.setAddress(request.getAddress());
        updatedApplicant.setCity(request.getCity());
        updatedApplicant.setObjectiveSummary(request.getObjectiveSummary());

        Applicant updated = applicantService.updateApplicant(applicant.getId(), updatedApplicant);
        
        // Update country in User if provided
        if (request.getCountry() != null && updated != null) {
            applicantService.updateUserCountry(updated.getUserId(), request.getCountry());
        }
        
        return updated != null ? toProfileResponse(updated) : null;
    }

    public EducationResponse addMyEducation(AddEducationRequest request) {
        Applicant applicant = getMyApplicant();

        Education education = new Education();
        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartDate(request.getStartDate());
        education.setEndDate(request.getEndDate());
        education.setDescription(request.getDescription());
        education.setCurrent(request.isCurrent());

        Applicant updated = applicantService.addEducation(applicant.getId(), education);

        if (updated == null) {
            return null;
        }

        Education added = updated.getEducation().get(updated.getEducation().size() - 1);
        return toEducationResponse(added);
    }

    public EducationResponse updateMyEducation(String educationId, UpdateEducationRequest request) {
        Applicant applicant = getMyApplicant();

        Education education = new Education();
        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartDate(request.getStartDate());
        education.setEndDate(request.getEndDate());
        education.setDescription(request.getDescription());
        education.setCurrent(request.isCurrent());

        Applicant updated = applicantService.updateEducation(applicant.getId(), educationId, education);

        if (updated == null) {
            return null;
        }

        return updated.getEducation().stream()
                .filter(edu -> edu.getId().toString().equals(educationId))
                .map(this::toEducationResponse)
                .findFirst()
                .orElse(null);
    }

    public boolean deleteMyEducation(String educationId) {
        Applicant applicant = getMyApplicant();
        return applicantService.deleteEducation(applicant.getId(), educationId) != null;
    }

    public WorkExperienceResponse addMyWorkExperience(AddWorkExperienceRequest request) {
        Applicant applicant = getMyApplicant();

        WorkExperience workExperience = new WorkExperience();
        workExperience.setCompany(request.getCompany());
        workExperience.setPosition(request.getPosition());
        workExperience.setDescription(request.getDescription());
        workExperience.setStartDate(request.getStartDate());
        workExperience.setEndDate(request.getEndDate());
        workExperience.setCurrent(request.isCurrent());

        Applicant updated = applicantService.addWorkExperience(applicant.getId(), workExperience);

        if (updated == null) {
            return null;
        }

        WorkExperience added = updated.getWorkExperience().get(updated.getWorkExperience().size() - 1);
        return toWorkExperienceResponse(added);
    }

    public WorkExperienceResponse updateMyWorkExperience(String workExperienceId, UpdateWorkExperienceRequest request) {
        Applicant applicant = getMyApplicant();

        WorkExperience workExperience = new WorkExperience();
        workExperience.setCompany(request.getCompany());
        workExperience.setPosition(request.getPosition());
        workExperience.setDescription(request.getDescription());
        workExperience.setStartDate(request.getStartDate());
        workExperience.setEndDate(request.getEndDate());
        workExperience.setCurrent(request.isCurrent());

        Applicant updated = applicantService.updateWorkExperience(applicant.getId(), workExperienceId, workExperience);

        if (updated == null) {
            return null;
        }

        return updated.getWorkExperience().stream()
                .filter(exp -> exp.getId().toString().equals(workExperienceId))
                .map(this::toWorkExperienceResponse)
                .findFirst()
                .orElse(null);
    }

    public boolean deleteMyWorkExperience(String workExperienceId) {
        Applicant applicant = getMyApplicant();
        return applicantService.deleteWorkExperience(applicant.getId(), workExperienceId) != null;
    }

    public ProfileResponse addMySkill(AddSkillRequest request) {
        Applicant applicant = getMyApplicant();
        Applicant updated = applicantService.addSkill(applicant.getId(), request.getSkill());
        return updated != null ? toProfileResponse(updated) : null;
    }

    public ProfileResponse addMySkills(AddSkillsRequest request) {
        Applicant applicant = getMyApplicant();
        Applicant updated = applicantService.addSkills(applicant.getId(), request.getSkills());
        return updated != null ? toProfileResponse(updated) : null;
    }

    public ProfileResponse deleteMySkill(String skill) {
        Applicant applicant = getMyApplicant();
        Applicant updated = applicantService.deleteSkill(applicant.getId(), skill);
        return updated != null ? toProfileResponse(updated) : null;
    }

    public ProfileResponse uploadMyAvatar(MultipartFile file) {
        Applicant applicant = getMyApplicant();
        Applicant updated = applicantService.uploadAvatar(applicant.getId(), file);
        return updated != null ? toProfileResponse(updated) : null;
    }
    
    // Portfolio operations for current user (/api/me endpoints)
    public PortfolioResponse getMyPortfolio() {
        Applicant applicant = getMyApplicant();
        return toPortfolioResponse(applicant);
    }
    
    public PortfolioItemResponse addMyPortfolioImage(MultipartFile file, String title) {
        try {
            Applicant applicant = getMyApplicant();
            System.out.println("Adding portfolio image for applicant: " + applicant.getId());
            Applicant updated = applicantService.addPortfolioImage(applicant.getId(), file, title);
            
            if (updated == null || updated.getPortfolioImages() == null || updated.getPortfolioImages().isEmpty()) {
                System.err.println("Failed to add portfolio image - updated applicant is null or has no images");
                return null;
            }
            
            // Return the newly added item
            PortfolioItem added = updated.getPortfolioImages().get(updated.getPortfolioImages().size() - 1);
            System.out.println("Successfully added portfolio image: " + added.getId());
            return toPortfolioItemResponse(added);
        } catch (SecurityException e) {
            System.err.println("Security error in addMyPortfolioImage: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Error in addMyPortfolioImage: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public boolean deleteMyPortfolioImage(String portfolioItemId) {
        Applicant applicant = getMyApplicant();
        return applicantService.deletePortfolioImage(applicant.getId(), portfolioItemId) != null;
    }
    
    public PortfolioItemResponse addMyPortfolioVideo(MultipartFile file, String title) {
        Applicant applicant = getMyApplicant();
        Applicant updated = applicantService.addPortfolioVideo(applicant.getId(), file, title);
        
        if (updated == null || updated.getPortfolioVideos() == null || updated.getPortfolioVideos().isEmpty()) {
            return null;
        }
        
        // Return the newly added item
        PortfolioItem added = updated.getPortfolioVideos().get(updated.getPortfolioVideos().size() - 1);
        return toPortfolioItemResponse(added);
    }
    
    public boolean deleteMyPortfolioVideo(String portfolioItemId) {
        Applicant applicant = getMyApplicant();
        return applicantService.deletePortfolioVideo(applicant.getId(), portfolioItemId) != null;
    }
    
    // Portfolio operations for specific applicant ID (legacy endpoints)
    public PortfolioResponse getPortfolio(String applicantId) {
        Applicant applicant = applicantService.getApplicantById(applicantId);
        return applicant != null ? toPortfolioResponse(applicant) : null;
    }
    
    public PortfolioItemResponse addPortfolioImage(String applicantId, MultipartFile file, String title) {
        validateOwnership(applicantId);
        Applicant updated = applicantService.addPortfolioImage(applicantId, file, title);
        
        if (updated == null || updated.getPortfolioImages() == null || updated.getPortfolioImages().isEmpty()) {
            return null;
        }
        
        PortfolioItem added = updated.getPortfolioImages().get(updated.getPortfolioImages().size() - 1);
        return toPortfolioItemResponse(added);
    }
    
    public boolean deletePortfolioImage(String applicantId, String portfolioItemId) {
        validateOwnership(applicantId);
        return applicantService.deletePortfolioImage(applicantId, portfolioItemId) != null;
    }
    
    public PortfolioItemResponse addPortfolioVideo(String applicantId, MultipartFile file, String title) {
        validateOwnership(applicantId);
        Applicant updated = applicantService.addPortfolioVideo(applicantId, file, title);
        
        if (updated == null || updated.getPortfolioVideos() == null || updated.getPortfolioVideos().isEmpty()) {
            return null;
        }
        
        PortfolioItem added = updated.getPortfolioVideos().get(updated.getPortfolioVideos().size() - 1);
        return toPortfolioItemResponse(added);
    }
    
    public boolean deletePortfolioVideo(String applicantId, String portfolioItemId) {
        validateOwnership(applicantId);
        return applicantService.deletePortfolioVideo(applicantId, portfolioItemId) != null;
    }

    // Helper methods
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }

        return authentication.getName();
    }

    private Applicant getMyApplicant() {
        String email = getCurrentUserEmail();

        // Get User entity to retrieve the User ID
        User user = authRepository.findByEmail(email);
        if (user == null) {
            throw new SecurityException("User not found. Please log in again.");
        }

        // Find applicant by User ID (not email)
        Applicant applicant = applicantService.getApplicantByUserId(user.getId());

        if (applicant == null) {
            throw new SecurityException("Applicant profile not found. Please create your profile first.");
        }

        return applicant;
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

        List<PortfolioItemResponse> portfolioImages = applicant.getPortfolioImages() != null
            ? applicant.getPortfolioImages().stream()
                .map(this::toPortfolioItemResponse)
                .collect(Collectors.toList())
            : List.of();

        List<PortfolioItemResponse> portfolioVideos = applicant.getPortfolioVideos() != null
            ? applicant.getPortfolioVideos().stream()
                .map(this::toPortfolioItemResponse)
                .collect(Collectors.toList())
            : List.of();

        // Fetch user to get planType and country
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        PlanType planType = user != null && user.getPlanType() != null
            ? user.getPlanType()
            : PlanType.FREEMIUM;
        Country country = user != null ? user.getCountry() : null;

        return new ProfileResponse(
            applicant.getId(),
            applicant.getUserId(),
            applicant.getFirstName(),
            applicant.getLastName(),
            country,
            applicant.getPhoneNumber(),
            applicant.getAddress(),
            applicant.getCity(),
            educationResponses,
            workExperienceResponses,
            skills,
            applicant.getObjectiveSummary(),
            planType,
            applicant.getAvatarUrl(),
            portfolioImages,
            portfolioVideos,
            applicant.getCreatedAt(),
            applicant.getUpdatedAt()
        );
    }
    
    private ApplicantListItemResponse toApplicantListItemResponse(Applicant applicant) {
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

        List<PortfolioItemResponse> portfolioImages = applicant.getPortfolioImages() != null
            ? applicant.getPortfolioImages().stream()
                .map(this::toPortfolioItemResponse)
                .collect(Collectors.toList())
            : List.of();

        List<PortfolioItemResponse> portfolioVideos = applicant.getPortfolioVideos() != null
            ? applicant.getPortfolioVideos().stream()
                .map(this::toPortfolioItemResponse)
                .collect(Collectors.toList())
            : List.of();

        // Fetch user to get planType and country
        User user = authRepository.findById(applicant.getUserId()).orElse(null);
        PlanType planType = user != null && user.getPlanType() != null
            ? user.getPlanType()
            : PlanType.FREEMIUM;
        Country country = user != null ? user.getCountry() : null;

        return new ApplicantListItemResponse(
            applicant.getId(),
            applicant.getFirstName(),
            applicant.getLastName(),
            country,
            applicant.getPhoneNumber(),
            applicant.getAddress(),
            applicant.getCity(),
            educationResponses,
            workExperienceResponses,
            skills,
            applicant.getObjectiveSummary(),
            planType,
            applicant.getAvatarUrl(),
            portfolioImages,
            portfolioVideos,
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
    
    private PortfolioItemResponse toPortfolioItemResponse(PortfolioItem item) {
        return new PortfolioItemResponse(
            item.getId().toString(),
            item.getUrl(),
            item.getResourceType(),
            item.getTitle(),
            item.getUploadedAt()
        );
    }
    
    private PortfolioResponse toPortfolioResponse(Applicant applicant) {
        List<PortfolioItemResponse> imageResponses = applicant.getPortfolioImages() != null
            ? applicant.getPortfolioImages().stream()
                .map(this::toPortfolioItemResponse)
                .collect(Collectors.toList())
            : List.of();

        List<PortfolioItemResponse> videoResponses = applicant.getPortfolioVideos() != null
            ? applicant.getPortfolioVideos().stream()
                .map(this::toPortfolioItemResponse)
                .collect(Collectors.toList())
            : List.of();

        return new PortfolioResponse(
            imageResponses,
            videoResponses,
            applicantService.getMaxPortfolioImages(),
            applicantService.getMaxPortfolioVideos()
        );
    }
}
