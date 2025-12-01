package com.DEVision.JobApplicant.applicant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.applicant.model.Applicant;
import com.DEVision.JobApplicant.applicant.repository.ApplicantRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ApplicantService {
    
    @Autowired
    private ApplicantRepository applicantRepository;
    
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
    
    public boolean deleteApplicant(String id) {
        if (applicantRepository.existsById(id)) {
            applicantRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

