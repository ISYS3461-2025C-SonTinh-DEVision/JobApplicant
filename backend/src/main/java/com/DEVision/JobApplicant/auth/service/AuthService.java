package com.DEVision.JobApplicant.auth.service;

//import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.jwt.JweUtil;

@Service
public class AuthService implements UserDetailsService {

    @Autowired
    private AuthRepository userRepository;
    
    @Autowired
    private JweUtil jweUtil;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole())
                .accountLocked(!user.isEnabled())
                .disabled(!user.isEnabled())
                .build();
    }
    
    /**
     * Get User entity by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    /**
     * Generate JWE tokens with full user claims (matching JM token structure)
     * Token claims: sub (userId), email, role, jti, iat, exp
     */
    public Map<String, String> createAuthTokens(UserDetails userDetails, boolean isAuthenticated) {
        Map<String, String> tokens = new HashMap<>();
        
        if (isAuthenticated) {
            // Get User entity to include full claims (userId, email, role)
            User user = userRepository.findByEmail(userDetails.getUsername());
            if (user == null) {
                throw new UsernameNotFoundException("User not found: " + userDetails.getUsername());
            }
            
            // Generate tokens with full user info (matching JM structure)
            String accessToken = jweUtil.generateToken(user);
            String refreshToken = jweUtil.generateRefreshToken(user);
            
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken);
        }
        
        return tokens;
    }
    
    /**
     * Refresh an access token using a refresh token
     */
    public Map<String, String> refreshToken(String refreshToken) {
        Map<String, String> tokens = new HashMap<>();
        
        if (jweUtil.verifyJweToken(refreshToken)) {
            // Extract email from token (for new tokens, email is in claims; for legacy, it's the subject)
            String email = jweUtil.extractEmail(refreshToken);
            User user = userRepository.findByEmail(email);
            
            if (user == null) {
                throw new IllegalArgumentException("User not found for refresh token");
            }
            
            // Generate new access token with full user info
            String newAccessToken = jweUtil.generateToken(user);
            
            tokens.put("accessToken", newAccessToken);
            tokens.put("refreshToken", refreshToken); // Return the existing refresh token
        } else {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        
        return tokens;
    }

    public User updateUser(String id, User updatedUser) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User existingUser = userData.get();
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setPassword(updatedUser.getPassword());

            return userRepository.save(existingUser);
        }

        return null;
    }

}
