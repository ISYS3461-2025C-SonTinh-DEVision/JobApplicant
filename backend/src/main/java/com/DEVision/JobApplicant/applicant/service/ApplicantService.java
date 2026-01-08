package com.DEVision.JobApplicant.applicant.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.entity.Education;
import com.DEVision.JobApplicant.applicant.entity.PortfolioItem;
import com.DEVision.JobApplicant.applicant.entity.WorkExperience;
import com.DEVision.JobApplicant.applicant.external.dto.ApplicantProfileEvent;
import com.DEVision.JobApplicant.applicant.external.service.ApplicantProfileEventProducer;
import com.DEVision.JobApplicant.applicant.internal.dto.ProfileResponse;
import com.DEVision.JobApplicant.applicant.internal.service.ApplicantInternalService;
import com.DEVision.JobApplicant.applicant.repository.ApplicantRepository;
import com.DEVision.JobApplicant.common.country.model.Country;
import com.DEVision.JobApplicant.common.storage.service.FileStorageService;
import com.DEVision.JobApplicant.common.storage.dto.FileUploadResult;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ApplicantService {
    
    private static final int MAX_EDUCATION_ENTRIES = 20;
    private static final int MAX_WORK_EXPERIENCE_ENTRIES = 20;
    private static final int MAX_SKILLS_ENTRIES = 50;
    private static final int MAX_PORTFOLIO_IMAGES = 20;
    private static final int MAX_PORTFOLIO_VIDEOS = 5;
    private static final String AVATAR_FOLDER = "applicant-avatars";
    private static final String PORTFOLIO_IMAGES_FOLDER = "applicant-portfolio-images";
    private static final String PORTFOLIO_VIDEOS_FOLDER = "applicant-portfolio-videos";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos
    
    @Autowired
    private ApplicantRepository applicantRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private ApplicantProfileEventProducer profileEventProducer;
    
    @Autowired
    @Lazy
    private ApplicantInternalService applicantInternalService;
    
    public Applicant createApplicant(Applicant applicant) {
        applicant.setCreatedAt(LocalDateTime.now());
        applicant.setUpdatedAt(LocalDateTime.now());
        return applicantRepository.save(applicant);
    }
    
    public Applicant getApplicantByUserId(String userId) {
        return applicantRepository.findByUserId(userId);
    }
    
    public Applicant getApplicantById(String id) {
        Optional<Applicant> applicant = applicantRepository.findById(id);
        return applicant.orElse(null);
    }
    
    public Applicant updateApplicant(String id, Applicant updatedApplicant) {
        Optional<Applicant> existingApplicant = applicantRepository.findById(id);
        
        if (existingApplicant.isPresent()) {
            Applicant applicant = existingApplicant.get();
            
            if (updatedApplicant.getFirstName() != null) {
                applicant.setFirstName(updatedApplicant.getFirstName());
            }
            if (updatedApplicant.getLastName() != null) {
                applicant.setLastName(updatedApplicant.getLastName());
            }
            boolean countryUpdated = false;
            if (updatedApplicant.getCountry() != null) {
                applicant.setCountry(updatedApplicant.getCountry());
                countryUpdated = true;
            }
            if (updatedApplicant.getPhoneNumber() != null) {
                applicant.setPhoneNumber(updatedApplicant.getPhoneNumber());
            }
            if (updatedApplicant.getAddress() != null) {
                applicant.setAddress(updatedApplicant.getAddress());
            }
            if (updatedApplicant.getCity() != null) {
                applicant.setCity(updatedApplicant.getCity());
            }
            if (updatedApplicant.getObjectiveSummary() != null) {
                applicant.setObjectiveSummary(updatedApplicant.getObjectiveSummary());
            }

            applicant.setUpdatedAt(LocalDateTime.now());
            
            Applicant saved = applicantRepository.save(applicant);
            
            // Send Kafka event if country was updated
            if (countryUpdated) {
                sendProfileEvent(saved, "COUNTRY_UPDATED");
            }
            
            return saved;
        }
        
        return null;
    }
    
    // Education Management
    public Applicant addEducation(String applicantId, Education education) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        
        if (applicant.getEducation().size() >= MAX_EDUCATION_ENTRIES) {
            throw new IllegalStateException("Maximum " + MAX_EDUCATION_ENTRIES + " education entries allowed. Please delete an existing entry first.");
        }
        
        education.setId(new ObjectId());
        applicant.getEducation().add(education);
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    public Applicant updateEducation(String applicantId, String educationId, Education updatedEducation) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        ObjectId objId = new ObjectId(educationId);
        
        Optional<Education> existingEducation = applicant.getEducation().stream()
                .filter(edu -> edu.getId().equals(objId))
                .findFirst();
        
        if (existingEducation.isEmpty()) {
            return null;
        }
        
        Education edu = existingEducation.get();
        edu.setInstitution(updatedEducation.getInstitution());
        edu.setDegree(updatedEducation.getDegree());
        edu.setFieldOfStudy(updatedEducation.getFieldOfStudy());
        edu.setStartDate(updatedEducation.getStartDate());
        edu.setEndDate(updatedEducation.getEndDate());
        edu.setDescription(updatedEducation.getDescription());
        edu.setCurrent(updatedEducation.isCurrent());
        
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    public Applicant deleteEducation(String applicantId, String educationId) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        ObjectId objId = new ObjectId(educationId);
        
        boolean removed = applicant.getEducation().removeIf(edu -> edu.getId().equals(objId));
        
        if (!removed) {
            return null;
        }
        
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    // Work Experience Management
    public Applicant addWorkExperience(String applicantId, WorkExperience workExperience) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        
        if (applicant.getWorkExperience().size() >= MAX_WORK_EXPERIENCE_ENTRIES) {
            throw new IllegalStateException("Maximum " + MAX_WORK_EXPERIENCE_ENTRIES + " work experience entries allowed. Please delete an existing entry first.");
        }
        
        workExperience.setId(new ObjectId());
        applicant.getWorkExperience().add(workExperience);
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    public Applicant updateWorkExperience(String applicantId, String workExperienceId, WorkExperience updatedWorkExperience) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        ObjectId objId = new ObjectId(workExperienceId);
        
        Optional<WorkExperience> existingWorkExperience = applicant.getWorkExperience().stream()
                .filter(exp -> exp.getId().equals(objId))
                .findFirst();
        
        if (existingWorkExperience.isEmpty()) {
            return null;
        }
        
        WorkExperience exp = existingWorkExperience.get();
        exp.setCompany(updatedWorkExperience.getCompany());
        exp.setPosition(updatedWorkExperience.getPosition());
        exp.setDescription(updatedWorkExperience.getDescription());
        exp.setStartDate(updatedWorkExperience.getStartDate());
        exp.setEndDate(updatedWorkExperience.getEndDate());
        exp.setCurrent(updatedWorkExperience.isCurrent());
        
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    public Applicant deleteWorkExperience(String applicantId, String workExperienceId) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        ObjectId objId = new ObjectId(workExperienceId);
        
        boolean removed = applicant.getWorkExperience().removeIf(exp -> exp.getId().equals(objId));
        
        if (!removed) {
            return null;
        }
        
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    // Avatar Upload
    public Applicant uploadAvatar(String applicantId, MultipartFile file) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        // Validate file
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files (JPG, PNG, WEBP) are allowed");
        }
        
        Applicant applicant = applicantOpt.get();
        
        // Delete old avatar if exists
        if (applicant.getAvatarUrl() != null) {
            // Extract publicId from URL if needed for deletion
            // For now, just upload new one (Cloudinary will handle it)
        }
        
        // Upload to Cloudinary
        FileUploadResult result = fileStorageService.uploadFile(file, AVATAR_FOLDER);
        applicant.setAvatarUrl(result.fileUrl());
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    // Skills Management
    public Applicant addSkill(String applicantId, String skill) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        
        if (applicant.getSkills().size() >= MAX_SKILLS_ENTRIES) {
            throw new IllegalStateException("Maximum " + MAX_SKILLS_ENTRIES + " skills allowed. Please delete an existing skill first.");
        }
        
        // Case-insensitive duplicate check
        String normalizedSkill = skill.trim();
        boolean alreadyExists = applicant.getSkills().stream()
                .anyMatch(s -> s.equalsIgnoreCase(normalizedSkill));
        
        if (alreadyExists) {
            throw new IllegalArgumentException("Skill already exists in your profile");
        }
        
        applicant.getSkills().add(normalizedSkill);
        applicant.setUpdatedAt(LocalDateTime.now());
        
        Applicant saved = applicantRepository.save(applicant);
        
        // Send Kafka event for skills update
        sendProfileEvent(saved, "SKILLS_UPDATED");
        
        return saved;
    }
    
    public Applicant addSkills(String applicantId, java.util.List<String> skills) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        
        int currentSize = applicant.getSkills().size();
        int newSkillsCount = skills.size();
        
        if (currentSize + newSkillsCount > MAX_SKILLS_ENTRIES) {
            throw new IllegalStateException("Adding " + newSkillsCount + " skills would exceed maximum of " + MAX_SKILLS_ENTRIES + ". Current: " + currentSize);
        }
        
        for (String skill : skills) {
            String normalizedSkill = skill.trim();
            boolean alreadyExists = applicant.getSkills().stream()
                    .anyMatch(s -> s.equalsIgnoreCase(normalizedSkill));
            
            if (!alreadyExists) {
                applicant.getSkills().add(normalizedSkill);
            }
        }
        
        applicant.setUpdatedAt(LocalDateTime.now());
        
        Applicant saved = applicantRepository.save(applicant);
        
        // Send Kafka event for skills update
        sendProfileEvent(saved, "SKILLS_UPDATED");
        
        return saved;
    }
    
    public Applicant deleteSkill(String applicantId, String skill) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        String normalizedSkill = skill.trim();
        
        // Case-insensitive removal
        boolean removed = applicant.getSkills().removeIf(s -> s.equalsIgnoreCase(normalizedSkill));
        
        if (!removed) {
            return null;
        }
        
        applicant.setUpdatedAt(LocalDateTime.now());
        
        Applicant saved = applicantRepository.save(applicant);
        
        // Send Kafka event for skills update
        sendProfileEvent(saved, "SKILLS_UPDATED");
        
        return saved;
    }
    
    public boolean deleteApplicant(String id) {
        if (applicantRepository.existsById(id)) {
            applicantRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Portfolio Image Management
    public Applicant addPortfolioImage(String applicantId, MultipartFile file, String title) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        
        // Initialize list if null
        if (applicant.getPortfolioImages() == null) {
            applicant.setPortfolioImages(new java.util.ArrayList<>());
        }
        
        if (applicant.getPortfolioImages().size() >= MAX_PORTFOLIO_IMAGES) {
            throw new IllegalStateException("Maximum " + MAX_PORTFOLIO_IMAGES + " portfolio images allowed. Please delete an existing image first.");
        }
        
        // Validate file
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files (JPG, PNG, WEBP, GIF) are allowed");
        }
        
        // Upload to Cloudinary
        FileUploadResult result = fileStorageService.uploadFile(file, PORTFOLIO_IMAGES_FOLDER);
        
        PortfolioItem portfolioItem = new PortfolioItem(
            result.fileUrl(),
            result.publicId(),
            result.resourceType(),
            title
        );
        
        applicant.getPortfolioImages().add(portfolioItem);
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    public Applicant deletePortfolioImage(String applicantId, String portfolioItemId) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        
        if (applicant.getPortfolioImages() == null) {
            return null;
        }
        
        org.bson.types.ObjectId objId = new org.bson.types.ObjectId(portfolioItemId);
        
        // Find the item to delete (to get publicId for Cloudinary deletion)
        Optional<PortfolioItem> itemToDelete = applicant.getPortfolioImages().stream()
                .filter(item -> item.getId().equals(objId))
                .findFirst();
        
        if (itemToDelete.isEmpty()) {
            return null;
        }
        
        // Delete from Cloudinary
        try {
            fileStorageService.deleteFile(itemToDelete.get().getPublicId(), itemToDelete.get().getResourceType());
        } catch (Exception e) {
            System.err.println("Warning: Failed to delete file from Cloudinary: " + e.getMessage());
        }
        
        // Remove from list
        applicant.getPortfolioImages().removeIf(item -> item.getId().equals(objId));
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    // Portfolio Video Management
    public Applicant addPortfolioVideo(String applicantId, MultipartFile file, String title) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        
        // Initialize list if null
        if (applicant.getPortfolioVideos() == null) {
            applicant.setPortfolioVideos(new java.util.ArrayList<>());
        }
        
        if (applicant.getPortfolioVideos().size() >= MAX_PORTFOLIO_VIDEOS) {
            throw new IllegalStateException("Maximum " + MAX_PORTFOLIO_VIDEOS + " portfolio videos allowed. Please delete an existing video first.");
        }
        
        // Validate file
        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 100MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new IllegalArgumentException("Only video files (MP4, MOV, AVI, WEBM) are allowed");
        }
        
        // Upload to Cloudinary
        FileUploadResult result = fileStorageService.uploadFile(file, PORTFOLIO_VIDEOS_FOLDER);
        
        PortfolioItem portfolioItem = new PortfolioItem(
            result.fileUrl(),
            result.publicId(),
            result.resourceType(),
            title
        );
        
        applicant.getPortfolioVideos().add(portfolioItem);
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    public Applicant deletePortfolioVideo(String applicantId, String portfolioItemId) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (applicantOpt.isEmpty()) {
            return null;
        }
        
        Applicant applicant = applicantOpt.get();
        
        if (applicant.getPortfolioVideos() == null) {
            return null;
        }
        
        org.bson.types.ObjectId objId = new org.bson.types.ObjectId(portfolioItemId);
        
        // Find the item to delete (to get publicId for Cloudinary deletion)
        Optional<PortfolioItem> itemToDelete = applicant.getPortfolioVideos().stream()
                .filter(item -> item.getId().equals(objId))
                .findFirst();
        
        if (itemToDelete.isEmpty()) {
            return null;
        }
        
        // Delete from Cloudinary
        try {
            fileStorageService.deleteFile(itemToDelete.get().getPublicId(), itemToDelete.get().getResourceType());
        } catch (Exception e) {
            System.err.println("Warning: Failed to delete file from Cloudinary: " + e.getMessage());
        }
        
        // Remove from list
        applicant.getPortfolioVideos().removeIf(item -> item.getId().equals(objId));
        applicant.setUpdatedAt(LocalDateTime.now());
        
        return applicantRepository.save(applicant);
    }
    
    // Getters for max limits
    public int getMaxPortfolioImages() {
        return MAX_PORTFOLIO_IMAGES;
    }
    
    public int getMaxPortfolioVideos() {
        return MAX_PORTFOLIO_VIDEOS;
    }
    
    /**
     * Helper method to send applicant profile event to Kafka
     * Converts Applicant entity to ProfileResponse, then to ApplicantProfileEvent
     */
    private void sendProfileEvent(Applicant applicant, String eventType) {
        try {
            ProfileResponse profileResponse = applicantInternalService.getProfileById(applicant.getId());
            if (profileResponse != null) {
                ApplicantProfileEvent event = convertToEvent(profileResponse, eventType);
                profileEventProducer.sendProfileEvent(event);
            }
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Failed to send profile event to Kafka: " + e.getMessage());
        }
    }
    
    /**
     * Convert ProfileResponse to ApplicantProfileEvent
     */
    private ApplicantProfileEvent convertToEvent(ProfileResponse profile, String eventType) {
        ApplicantProfileEvent event = new ApplicantProfileEvent(eventType);
        event.setId(profile.getId());
        event.setUserId(profile.getUserId());
        event.setFirstName(profile.getFirstName());
        event.setLastName(profile.getLastName());
        event.setCountry(profile.getCountry());
        event.setPhoneNumber(profile.getPhoneNumber());
        event.setAddress(profile.getAddress());
        event.setCity(profile.getCity());
        event.setEducation(profile.getEducation());
        event.setWorkExperience(profile.getWorkExperience());
        event.setSkills(profile.getSkills());
        event.setObjectiveSummary(profile.getObjectiveSummary());
        event.setPlanType(profile.getPlanType());
        event.setAvatarUrl(profile.getAvatarUrl());
        event.setPortfolioImages(profile.getPortfolioImages());
        event.setPortfolioVideos(profile.getPortfolioVideos());
        event.setCreatedAt(profile.getCreatedAt());
        event.setUpdatedAt(profile.getUpdatedAt());
        return event;
    }
    
    /**
     * Search applicants with pagination and filters
     * @param keyword Search keyword for firstName, lastName, or city
     * @param country Filter by country
     * @param skill Filter by technical skill
     * @param page Page number (0-based)
     * @param size Page size
     * @param sortBy Field to sort by (default: createdAt)
     * @param sortDirection Sort direction (asc or desc)
     * @return Page of applicants matching the criteria
     */
    public Page<Applicant> searchApplicants(String keyword, Country country, String skill,
                                            int page, int size, String sortBy, String sortDirection) {
        // Create sort object
        Sort sort = sortDirection.equalsIgnoreCase("asc") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasCountry = country != null;
        boolean hasSkill = skill != null && !skill.trim().isEmpty();
        
        // Determine which query to use based on filters
        if (hasKeyword && hasCountry && hasSkill) {
            return applicantRepository.searchByKeywordAndCountryAndSkill(keyword.trim(), country, skill.trim(), pageable);
        } else if (hasKeyword && hasCountry) {
            return applicantRepository.searchByKeywordAndCountry(keyword.trim(), country, pageable);
        } else if (hasKeyword && hasSkill) {
            return applicantRepository.searchByKeywordAndSkill(keyword.trim(), skill.trim(), pageable);
        } else if (hasCountry && hasSkill) {
            return applicantRepository.findByCountryAndSkillsContainingIgnoreCase(country, skill.trim(), pageable);
        } else if (hasKeyword) {
            return applicantRepository.searchByKeyword(keyword.trim(), pageable);
        } else if (hasCountry) {
            return applicantRepository.findByCountry(country, pageable);
        } else if (hasSkill) {
            return applicantRepository.findBySkillsContainingIgnoreCase(skill.trim(), pageable);
        } else {
            return applicantRepository.findAll(pageable);
        }
    }
}

