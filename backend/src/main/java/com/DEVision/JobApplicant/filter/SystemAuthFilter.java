package com.DEVision.JobApplicant.filter;

import java.io.IOException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import com.DEVision.JobApplicant.common.config.SystemAuthConfig;
import com.DEVision.JobApplicant.jwt.CognitoJwtVerifier;
import com.DEVision.JobApplicant.jwt.JweTokenVerifier;
import com.DEVision.JobApplicant.jwt.JweTokenVerifier.TokenVerificationResult;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filter for system-to-system authentication
 * Validates tokens from external systems by calling their verification API
 */
@Component
public class SystemAuthFilter extends OncePerRequestFilter {
    
    @Autowired
    private SystemAuthConfig systemAuthConfig;
    
    @Autowired
    private JweTokenVerifier jweTokenVerifier;

    @Autowired
    private CognitoJwtVerifier cognitoJwtVerifier;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestPath = request.getServletPath();
        
        // Only apply to system-to-system endpoints
        if (!isSystemEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean isValid = false;

        // 1) Prefer Cognito Bearer token on Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String bearerToken = authHeader.substring(7);
            isValid = cognitoJwtVerifier.validateAccessToken(bearerToken);
        }

        // 2) Fallback to existing X-System-Authorization header + JM verification
        if (!isValid) {
            String systemAuthToken = request.getHeader(SystemAuthConfig.SYSTEM_AUTH_HEADER);

            if (systemAuthToken != null) {
                // Extract token from "Bearer <token>" format
                String token = systemAuthToken;
                if (systemAuthToken.startsWith("Bearer ")) {
                    token = systemAuthToken.substring(7);
                }

                if (systemAuthConfig.isJobManagerConfigured() &&
                    systemAuthConfig.getJobManagerVerifyTokenUrl() != null &&
                    !systemAuthConfig.getJobManagerVerifyTokenUrl().isEmpty()) {
                    isValid = validateTokenWithJobManager(systemAuthToken);
                }

                // Fallback: Try local verification (only works if JM encrypted with OUR public key)
                // This is NOT the normal case - normally JM uses their own keys
                if (!isValid && systemAuthConfig.isVerifyLocally()) {
                    isValid = validateTokenLocally(token);
                }
            }
        }

        if (isValid) {
            // Create authentication for system
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    SystemAuthConfig.JOB_MANAGER_SYSTEM,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_SYSTEM"))
                );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("System-to-system authentication successful for: " + requestPath);
        } else {
            System.err.println("System-to-system authentication failed for: " + requestPath);
        }

        filterChain.doFilter(request, response);
    }
    
    /**
     * Check if the request path is a system-to-system endpoint
     */
    private boolean isSystemEndpoint(String path) {
        // Endpoints that Job Manager System needs to access
        return path.startsWith("/api/applications/job/");
    }
    
    /**
     * Validate JWE token locally by decrypting and verifying claims
     * 
     * NOTE: This only works if JM encrypted the token with JobApplicant's public key.
     * This is NOT the normal case - normally JM generates tokens with their own keys
     * for their own system, and we cannot decrypt those without their private key.
     * 
     * Use API-based verification (validateTokenWithJobManager) for normal system-to-system auth.
     * 
     * @param token JWE token string (without "Bearer " prefix)
     * @return true if token is valid
     */
    private boolean validateTokenLocally(String token) {
        try {
            TokenVerificationResult result = jweTokenVerifier.verifyJobManagerToken(
                token,
                systemAuthConfig.getJobManagerExpectedIssuer(),
                systemAuthConfig.getJobManagerExpectedSystemId()
            );
            
            if (result.isValid()) {
                System.out.println("Local JWE token verification successful. System: " + result.getSystemId());
                return true;
            } else {
                System.err.println("Local JWE token verification failed: " + result.getMessage());
                return false;
            }
        } catch (Exception e) {
            System.err.println("Error during local token verification: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Validate token by calling Job Manager's verify-token API (fallback method)
     * @param token The token from X-System-Authorization header (format: "Bearer <token>")
     * @return true if Job Manager confirms the token is valid
     */
    private boolean validateTokenWithJobManager(String token) {
        if (!systemAuthConfig.isJobManagerConfigured()) {
            System.err.println("Job Manager verify-token URL not configured");
            return false;
        }
        
        try {
            String verifyUrl = systemAuthConfig.getJobManagerVerifyTokenUrl();
            
            // Create request headers with the token
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", token); // Pass the token as-is (Bearer <token>)
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // Call Job Manager's verify-token API
            ResponseEntity<TokenVerificationResponse> response = restTemplate.exchange(
                verifyUrl,
                HttpMethod.GET,
                entity,
                TokenVerificationResponse.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                boolean isValid = response.getBody().isValid();
                System.out.println("Job Manager token verification result: " + isValid);
                return isValid;
            }
            
            return false;
            
        } catch (Exception e) {
            System.err.println("Failed to verify token with Job Manager: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Response from Job Manager's verify-token API
     */
    private static class TokenVerificationResponse {
        private boolean valid;
        private String systemId;
        private String message;
        
        public boolean isValid() {
            return valid;
        }
        
        public void setValid(boolean valid) {
            this.valid = valid;
        }
        
        public String getSystemId() {
            return systemId;
        }
        
        public void setSystemId(String systemId) {
            this.systemId = systemId;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
