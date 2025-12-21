package com.DEVision.JobApplicant.application.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.DEVision.JobApplicant.application.entity.Application;

import java.util.List;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {
    
    // Find all applications for a specific job post
    List<Application> findByJobPostId(String jobPostId);
    
    // Find all applications by an applicant
    List<Application> findByApplicantId(String applicantId);
    
    // Find all applications by an applicant (paginated)
    Page<Application> findByApplicantId(String applicantId, Pageable pageable);
    
    // Find applications by status for a job post
    List<Application> findByJobPostIdAndStatus(String jobPostId, Application.ApplicationStatus status);
    
    // Find applications by status for an applicant
    List<Application> findByApplicantIdAndStatus(String applicantId, Application.ApplicationStatus status);
    
    // Find applications by status for an applicant (paginated)
    Page<Application> findByApplicantIdAndStatus(String applicantId, Application.ApplicationStatus status, Pageable pageable);
    
    // Check if applicant already applied to a job post
    boolean existsByJobPostIdAndApplicantId(String jobPostId, String applicantId);
    
    // Count applications for a job post
    long countByJobPostId(String jobPostId);
    
    // Count applications by an applicant
    long countByApplicantId(String applicantId);
    
    // Count applications by an applicant and status
    long countByApplicantIdAndStatus(String applicantId, Application.ApplicationStatus status);
}

