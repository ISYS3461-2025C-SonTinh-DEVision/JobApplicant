package com.DEVision.JobApplicant.auth.service;

//import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.auth.model.AuthModel;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.jwt.JwtUtil;

@Service
public class AuthService implements UserDetailsService {

    @Autowired
    private AuthRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AuthModel user = userRepository.findByEmail(username);
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }
        
        return User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole())
                .accountLocked(!user.isEnabled())
                .disabled(!user.isEnabled())
                .build();
    }
    
    public AuthModel createUser(AuthModel user) {
        return userRepository.save(user);
    }
    
    // Generate JWT tokens
    public Map<String, String> createAuthTokens(UserDetails userDetails, boolean isAuthenticated) {
        Map<String, String> tokens = new HashMap<>();
        
        if (isAuthenticated) {
            String accessToken = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);
            
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken);
        }
        
        return tokens;
    }
    
    // Refresh an access token using a refresh token
    public Map<String, String> refreshToken(String refreshToken) {
        Map<String, String> tokens = new HashMap<>();
        
        if (jwtUtil.verifyJwtSignature(refreshToken)) {
            String username = jwtUtil.extractUsername(refreshToken);
            UserDetails userDetails = this.loadUserByUsername(username);
            
            // Generate new access token
            String newAccessToken = jwtUtil.generateToken(userDetails);
            
            tokens.put("accessToken", newAccessToken);
            tokens.put("refreshToken", refreshToken); // Return the existing refresh token
        } else {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        
        return tokens;
    }

    public AuthModel updateUser(String id, AuthModel updatedUser) {
        Optional<AuthModel> userData = userRepository.findById(id);
        
        if (userData.isPresent()) {
            AuthModel existingUser = userData.get();
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setPassword(updatedUser.getPassword());

            return userRepository.save(existingUser);
        }
        
        return null;
    }

}
