package com.DEVision.JobApplicant.auth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.auth.entity.User;

public interface AuthRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    User findByActivationToken(String activationToken);
    User findByPasswordResetToken(String passwordResetToken);
    boolean existsByEmail(String email);
}
