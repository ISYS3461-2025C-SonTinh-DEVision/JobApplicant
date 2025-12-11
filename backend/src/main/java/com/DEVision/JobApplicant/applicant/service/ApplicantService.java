package com.DEVision.JobApplicant.applicant.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.entity.Education;
import com.DEVision.JobApplicant.applicant.entity.WorkExperience;
import com.DEVision.JobApplicant.applicant.repository.ApplicantRepository;
import com.DEVision.JobApplicant.common.storage.service.FileStorageService;
import com.DEVision.JobApplicant.common.storage.dto.FileUploadResult;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ApplicantService {
    
    private static final int MAX_EDUCATION_ENTRIES = 20;
    private static final int MAX_WORK_EXPERIENCE_ENTRIES = 20;
    private static final int MAX_SKILLS_ENTRIES = 50;
    private static final String AVATAR_FOLDER = "applicant-avatars";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    @Autowired
    private ApplicantRepository applicantRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
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
            if (updatedApplicant.getCountry() != null) {
                applicant.setCountry(updatedApplicant.getCountry());
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
            
            applicant.setUpdatedAt(LocalDateTime.now());
            
            return applicantRepository.save(applicant);
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
        
        return applicantRepository.save(applicant);
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
        
        return applicantRepository.save(applicant);
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
        
        return applicantRepository.save(applicant);
    }
    
    public boolean deleteApplicant(String id) {
        if (applicantRepository.existsById(id)) {
            applicantRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

