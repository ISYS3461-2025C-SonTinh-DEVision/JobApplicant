package com.DEVision.JobApplicant.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.DEVision.JobApplicant.jwt.JwtUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

/**
 * System-to-system authentication endpoints
 * Allows external systems to verify Job Applicant tokens
 */
@RestController
@RequestMapping("/api/system")
@Tag(name = "System Authentication", description = "Endpoints for system-to-system token verification")
public class SystemAuthController {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Operation(
        summary = "Verify Job Applicant token",
        description = "Allows external systems (like Job Manager) to verify if a Job Applicant token is valid. " +
                      "Pass the token in the Authorization header as 'Bearer <token>'."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token verification result returned"),
        @ApiResponse(responseCode = "400", description = "No token provided")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/verify-token")
    public ResponseEntity<Map<String, Object>> verifyToken(
            @RequestHeader(value = "Authorization", required = false)
            @io.swagger.v3.oas.annotations.Parameter(hidden = true) String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Check if Authorization header is provided
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("valid", false);
            response.put("message", "No token provided or invalid format. Use 'Bearer <token>'");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        String token = authHeader.substring(7);
        
        try {
            // Verify the token signature and expiration
            boolean isValid = jwtUtil.verifyJwtSignature(token);
            
            if (isValid) {
                String username = jwtUtil.extractUsername(token);
                
                response.put("valid", true);
                response.put("systemId", "JOB_APPLICANT_SYSTEM");
                response.put("username", username);
                response.put("message", "Token is valid");
                
                return ResponseEntity.ok(response);
            } else {
                response.put("valid", false);
                response.put("message", "Token is invalid or expired");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            response.put("valid", false);
            response.put("message", "Token verification failed: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}

