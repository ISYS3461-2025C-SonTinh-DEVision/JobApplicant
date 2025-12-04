package com.DEVision.JobApplicant.auth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.auth.model.AuthModel;

public interface AuthRepository extends MongoRepository<AuthModel, String> {
    AuthModel findByEmail(String email);
    AuthModel findByActivationToken(String activationToken);
    AuthModel findByPasswordResetToken(String passwordResetToken);
    boolean existsByEmail(String email);
}
