package com.DEVision.JobApplicant.auth.external.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.external.dto.UserDto;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;

/**
 * External service for other backend modules to interact with users
 * Main purpose: Other modules call this to get user information
 */
@Service
public class AuthExternalService {

    @Autowired
    private AuthRepository userRepository;

    /**
     * Get user by ID
     * Used by other modules to fetch user data
     */
    public UserDto getUserById(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        return user != null ? toDto(user) : null;
    }

    /**
     * Get user by email
     * Used by other modules to fetch user data by email
     */
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        return user != null ? toDto(user) : null;
    }

    /**
     * Check if user exists by email
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Check if user exists by ID
     */
    public boolean existsById(String userId) {
        return userRepository.existsById(userId);
    }

    /**
     * Validate if user is activated
     */
    public boolean isUserActivated(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        return user != null && user.isActivated();
    }

    /**
     * Check if user is enabled
     */
    public boolean isUserEnabled(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        return user != null && user.isEnabled();
    }

    // Convert entity to DTO
    private UserDto toDto(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getRole(),
            user.isEnabled(),
            user.isActivated()
        );
    }
}
