package com.DEVision.JobApplicant.applicant.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.DEVision.JobApplicant.applicant.model.Applicant;

@Repository
public interface ApplicantRepository extends MongoRepository<Applicant, String> {
    Applicant findByUserId(String userId);
}

