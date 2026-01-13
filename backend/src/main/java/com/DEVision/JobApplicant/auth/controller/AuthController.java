package com.DEVision.JobApplicant.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import com.DEVision.JobApplicant.auth.internal.dto.AuthResponse;
import com.DEVision.JobApplicant.auth.internal.dto.ForgotPasswordRequest;
import com.DEVision.JobApplicant.auth.internal.dto.LoginRequest;
import com.DEVision.JobApplicant.auth.internal.dto.OAuth2LoginRequest;
import com.DEVision.JobApplicant.auth.internal.dto.RegisterRequest;
import com.DEVision.JobApplicant.auth.internal.dto.RegistrationResponse;
import com.DEVision.JobApplicant.auth.internal.dto.ResendActivationRequest;
import com.DEVision.JobApplicant.auth.internal.dto.ResetPasswordRequest;
import com.DEVision.JobApplicant.auth.internal.service.AuthInternalService;
import com.DEVision.JobApplicant.auth.config.AuthConfig;
import com.DEVision.JobApplicant.common.config.HttpOnlyCookieConfig;
import com.DEVision.JobApplicant.common.redis.RedisService;
import com.DEVision.JobApplicant.jwt.JweUtil;

import java.util.HashMap;
import java.util.Map;

import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.service.ApplicantService;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and authorization endpoints")
class AuthController {

    @Autowired
    private AuthInternalService authInternalService;

    @Autowired
    private JweUtil jweUtil;

    @Autowired
    private RedisService redisService;

    @Autowired
    private AuthRepository userRepository;

    @Autowired
    private ApplicantService applicantService;

@Operation(summary = "Register new user", description = "Create a new applicant account with email activation")
@ApiResponses(value = {
    @ApiResponse(responseCode = "201", description = "Registration successful, activation email sent"),
    @ApiResponse(responseCode = "409", description = "Email already in use"),
    @ApiResponse(responseCode = "400", description = "Invalid input or registration failed")
})
@PostMapping("/register")
public ResponseEntity<RegistrationResponse> registerUser(@Valid @RequestBody RegisterRequest registrationDto) {
    try {
        RegistrationResponse response = authInternalService.registerUser(registrationDto);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new RegistrationResponse(
                        null, null,
                        registrationDto.getEmail(),
                        "Registration failed: " + e.getMessage(),
                        false
                ));
    }
}

    /**
     * Activate user account using activation token
     */
    @Operation(summary = "Activate account", description = "Activate user account using token from activation email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Account activated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
    @GetMapping("/activate")
    public ResponseEntity<?> activateAccount(@RequestParam("token") String token) {
        try {
            Map<String, Object> response = authInternalService.activateAccount(token);

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("message", "Activation failed: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Resend activation email with rate limiting
     */
    @Operation(summary = "Resend activation email", description = "Resend account activation email with 60s rate limit")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Activation email sent"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded - wait before retrying"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @PostMapping("/resend-activation")
    public ResponseEntity<?> resendActivation(@Valid @RequestBody ResendActivationRequest request) {
        try {
            String email = request.getEmail().trim().toLowerCase();
            
            // Check rate limit using Redis
            if (!redisService.allowResendActivation(email)) {
                long remainingCooldown = redisService.getRemainingResendCooldown(email);
                return new ResponseEntity<>(
                    Map.of(
                        "message", "Please wait before requesting another activation email.",
                        "success", false,
                        "rateLimited", true,
                        "retryAfter", remainingCooldown
                    ),
                    HttpStatus.TOO_MANY_REQUESTS
                );
            }
            
            // Process resend request
            Map<String, Object> response = authInternalService.resendActivationEmail(email);
            
            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error resending activation: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to resend activation email. Please try again later.", "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    /**
     * Login endpoint with brute-force protection
     * 
     * Requirement 2.1.1: Protocol-aware authentication
     * - If HTTPS: Credentials are sent in plaintext within request body
     * - If HTTP (no HTTPS): Credentials are sent using Basic Authentication header
     * 
     * This endpoint supports both methods for maximum compatibility.
     */
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens in HttpOnly cookies. Protected against brute-force attacks: max 5 attempts per 60 seconds. Supports both Basic Auth header (HTTP) and JSON body (HTTPS).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials or account not activated"),
        @ApiResponse(responseCode = "429", description = "Too many failed login attempts - rate limit exceeded")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody(required = false) LoginRequest loginRequest,
            @org.springframework.web.bind.annotation.RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            HttpServletResponse response) {
        try {
            String email;
            String password;
            
            // Per Requirement 2.1.1: Support both Basic Auth header and JSON body
            if (authorizationHeader != null && authorizationHeader.startsWith("Basic ")) {
                // HTTP mode: Parse Basic Authentication header
                // Format: "Basic base64(email:password)"
                try {
                    String base64Credentials = authorizationHeader.substring("Basic ".length());
                    String credentials = new String(java.util.Base64.getDecoder().decode(base64Credentials));
                    String[] parts = credentials.split(":", 2);
                    if (parts.length != 2) {
                        throw new IllegalArgumentException("Invalid Basic Authentication format");
                    }
                    email = parts[0];
                    password = parts[1];
                    System.out.println("[AuthController] Using Basic Authentication (HTTP mode)");
                } catch (IllegalArgumentException e) {
                    return new ResponseEntity<>(
                        Map.of("message", "Invalid Basic Authentication format"),
                        HttpStatus.BAD_REQUEST
                    );
                }
            } else if (loginRequest != null && loginRequest.getEmail() != null && loginRequest.getPassword() != null) {
                // HTTPS mode: Read credentials from JSON body
                email = loginRequest.getEmail();
                password = loginRequest.getPassword();
                System.out.println("[AuthController] Using JSON body authentication (HTTPS mode)");
            } else {
                return new ResponseEntity<>(
                    Map.of("message", "Credentials required. Use Basic Auth header or JSON body with email/password."),
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Create LoginRequest for service
            LoginRequest request = new LoginRequest(email, password);
            AuthResponse authResponse = authInternalService.login(request);

            // Set HTTP-only cookie for access token (5 hours)
            Cookie accessTokenCookie = HttpOnlyCookieConfig.createCookie(AuthConfig.AUTH_COOKIE_NAME, authResponse.getAccessToken());
            response.addCookie(accessTokenCookie);

            // Set HTTP-only cookie for refresh token (7 days)
            Cookie refreshTokenCookie = HttpOnlyCookieConfig.createCookie(AuthConfig.REFRESH_COOKIE_NAME, authResponse.getRefreshToken());
            refreshTokenCookie.setMaxAge(86400 * 7); // 7 days
            response.addCookie(refreshTokenCookie);

            // Only return success message - tokens are in HttpOnly cookies (secure)
            // Note: Access token also returned for clients that need it (e.g., mobile apps)
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("accessToken", authResponse.getAccessToken());
            responseBody.put("message", "Login successful");

            return new ResponseEntity<>(responseBody, HttpStatus.OK);

        } catch (Exception e) {
            // Check if it's a rate limiting error
            if (e.getMessage().contains("Too many failed login attempts")) {
                return new ResponseEntity<>(
                    Map.of(
                        "message", e.getMessage(),
                        "rateLimited", true
                    ),
                    HttpStatus.TOO_MANY_REQUESTS
                );
            }
            
            return new ResponseEntity<>(
                Map.of("message", e.getMessage()),
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    /**
     * OAuth2 login endpoint (Google SSO) - ID Token Flow
     *
     * This endpoint implements the ID Token Flow (Client-Side Flow):
     * 1. Frontend handles Google Sign-In using Google's JavaScript SDK
     * 2. Google returns an ID token directly to the frontend
     * 3. Frontend sends the ID token to this endpoint
     * 4. Backend verifies the token with Google's tokeninfo endpoint
     * 5. Backend creates/logs in the user and returns JWT tokens
     *
     * SRS Requirement 1.3.2: Users registered via SSO cannot use password authentication
     *
     * See: backend/OAUTH2_SSO_GUIDE.md for complete implementation details
     */
    @Operation(summary = "OAuth2 login (Google SSO)", description = "Authenticate user with Google ID token and return JWT tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid ID token or OAuth2 authentication failed")
    })
    @PostMapping("/oauth2/login")
    public ResponseEntity<?> oauth2Login(
            @Valid @RequestBody OAuth2LoginRequest oauth2LoginRequest,
            HttpServletResponse response) {
        try {
            AuthResponse authResponse = authInternalService.oauth2Login(oauth2LoginRequest);

            // Set HTTP-only cookie for access token (5 hours)
            Cookie accessTokenCookie = HttpOnlyCookieConfig.createCookie(AuthConfig.AUTH_COOKIE_NAME, authResponse.getAccessToken());
            response.addCookie(accessTokenCookie);

            // Set HTTP-only cookie for refresh token (7 days)
            Cookie refreshTokenCookie = HttpOnlyCookieConfig.createCookie(AuthConfig.REFRESH_COOKIE_NAME, authResponse.getRefreshToken());
            refreshTokenCookie.setMaxAge(86400 * 7); // 7 days
            response.addCookie(refreshTokenCookie);

            // Return response with access token
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("accessToken", authResponse.getAccessToken());
            responseBody.put("message", "OAuth2 login successful");

            return new ResponseEntity<>(responseBody, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("message", "OAuth2 login failed: " + e.getMessage()),
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    /**
     * Refresh token endpoint (placeholder - original implementation retained below)
     */
    @Operation(summary = "Refresh access token", description = "Get new access token using refresh token from cookie")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Get refresh token from cookie
            String refreshToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if (AuthConfig.REFRESH_COOKIE_NAME.equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (refreshToken == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Refresh token not found"),
                    HttpStatus.UNAUTHORIZED
                );
            }

            AuthResponse authResponse = authInternalService.refreshToken(refreshToken);

            // Update refresh token cookie
            Cookie newRefreshTokenCookie = HttpOnlyCookieConfig.createCookie(AuthConfig.REFRESH_COOKIE_NAME, authResponse.getRefreshToken());
            newRefreshTokenCookie.setMaxAge(86400 * 7); // 7 days
            response.addCookie(newRefreshTokenCookie);

            return new ResponseEntity<>(
                Map.of("accessToken", authResponse.getAccessToken()),
                HttpStatus.OK
            );

        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("message", "Failed to refresh token: " + e.getMessage()),
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    /**
     * Endpoint to check if the user is authenticated and has a valid session.
     * Returns user info and optionally refreshes the access token.
     */
    @Operation(summary = "Check session", description = "Verify if user session is valid and return user info")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session is valid"),
        @ApiResponse(responseCode = "401", description = "Session expired or invalid")
    })
    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(
        HttpServletRequest request,
        HttpServletResponse response,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // If we get here and userDetails is not null, the user is authenticated
        // (AuthRequestFilter already validated the token from cookie or Bearer header)
        if (userDetails != null) {
            try {
                // Get user and applicant details for complete user info
                User user = userRepository.findByEmail(userDetails.getUsername());
                Applicant applicant = user != null ? applicantService.getApplicantByUserId(user.getId()) : null;

                Map<String, Object> result = new HashMap<>();
                result.put("authenticated", true);
                result.put("username", userDetails.getUsername());
                result.put("roles", userDetails.getAuthorities());
                
                // Add user and applicant IDs for profile lookup
                if (user != null) {
                    result.put("userId", user.getId());
                    result.put("email", user.getEmail());
                    // Add authProvider for SSO detection (SRS 1.3.2)
                    result.put("authProvider", user.getAuthProvider() != null ? user.getAuthProvider() : "local");
                    // Indicate if user has set a local password (for SSO conversion flow)
                    // SSO users have a random UUID password, so they "don't have" a usable password
                    result.put("hasLocalPassword", !"google".equals(user.getAuthProvider()));
                }
                if (applicant != null) {
                    result.put("applicantId", applicant.getId());
                    result.put("firstName", applicant.getFirstName());
                    result.put("lastName", applicant.getLastName());
                    result.put("avatarUrl", applicant.getAvatarUrl()); // Include avatar for sidebar/header
                }

                // Optionally refresh the access token and update cookie
                String newToken = jweUtil.generateToken(userDetails);
                Cookie newCookie = HttpOnlyCookieConfig.createCookie(
                    AuthConfig.AUTH_COOKIE_NAME, 
                    newToken
                );
                response.addCookie(newCookie);

                // Return new token for clients using Bearer auth
                result.put("accessToken", newToken);

                return new ResponseEntity<>(result, HttpStatus.OK);
            } catch (Exception e) {
                System.err.println("Error checking session: " + e.getMessage());
            }
        }
        
        // If we get here, either user is not authenticated or there was an error
        Map<String, Object> result = new HashMap<>();
        result.put("authenticated", false);
        return new ResponseEntity<>(result, HttpStatus.UNAUTHORIZED);
    }
    
    /**
     * Endpoint to logout user by clearing auth cookies and blacklisting tokens
     */
    @Operation(summary = "User logout", description = "Logout user, clear cookies, and blacklist tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful"),
        @ApiResponse(responseCode = "500", description = "Logout failed")
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Extract tokens from cookies
            Cookie[] cookies = request.getCookies();
            String accessToken = null;
            String refreshToken = null;

            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (AuthConfig.AUTH_COOKIE_NAME.equals(cookie.getName())) {
                        accessToken = cookie.getValue();
                    } else if (AuthConfig.REFRESH_COOKIE_NAME.equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                    }
                }
            }

            // Blacklist tokens in Redis (prevent reuse) - optional feature
            try {
                if (accessToken != null && !accessToken.isEmpty()) {
                    redisService.blacklistToken(accessToken, 1440); // 24 hours (match token expiry)
                }
                if (refreshToken != null && !refreshToken.isEmpty()) {
                    redisService.blacklistToken(refreshToken, 10080); // 7 days (match refresh token expiry)
                }
            } catch (Exception redisException) {
                // Redis unavailable - logout still succeeds, but tokens won't be blacklisted
                System.out.println("Warning: Redis unavailable, tokens not blacklisted during logout: " + redisException.getMessage());
            }

            // Create expired cookies to clear the existing ones
            Cookie accessCookie = new Cookie(AuthConfig.AUTH_COOKIE_NAME, "");
            accessCookie.setMaxAge(0);
            accessCookie.setPath("/");

            Cookie refreshCookie = new Cookie(AuthConfig.REFRESH_COOKIE_NAME, "");
            refreshCookie.setMaxAge(0);
            refreshCookie.setPath("/");

            response.addCookie(accessCookie);
            response.addCookie(refreshCookie);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Logged out successfully");
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error during logout: " + e.getMessage());
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Logout failed");
            return new ResponseEntity<>(result, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Forgot password - Send reset password email
     */
    @Operation(summary = "Forgot password", description = "Request password reset link via email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset email sent"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "500", description = "Failed to send email")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            Map<String, Object> response = authInternalService.forgotPassword(request.getEmail());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in forgot password: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "An error occurred. Please try again later.", "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Reset password using token from email
     */
    @Operation(summary = "Reset password", description = "Reset password using token from reset email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset successful"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            Map<String, Object> response = authInternalService.resetPassword(
                request.getToken(), 
                request.getNewPassword()
            );
            
            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error resetting password: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to reset password: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Change password for authenticated user
     * Requirement 3.1.1: Job Applicants shall be able to edit their Password
     */
    @Operation(summary = "Change password", description = "Change password for authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid current password or validation error"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "403", description = "SSO users cannot change password")
    })
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody com.DEVision.JobApplicant.auth.internal.dto.ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Authentication required", "success", false),
                    HttpStatus.UNAUTHORIZED
                );
            }

            // Validate password confirmation
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return new ResponseEntity<>(
                    Map.of("message", "New password and confirmation do not match", "success", false),
                    HttpStatus.BAD_REQUEST
                );
            }

            // Get user ID from authenticated user
            User user = userRepository.findByEmail(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(
                    Map.of("message", "User not found", "success", false),
                    HttpStatus.NOT_FOUND
                );
            }

            Map<String, Object> response = authInternalService.changePassword(
                user.getId(),
                request.getCurrentPassword(),
                request.getNewPassword()
            );

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                // Check if SSO user
                if (response.containsKey("isSsoUser") && (boolean) response.get("isSsoUser")) {
                    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
                }
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error changing password: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to change password: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Set password for SSO user (converts to local authentication)
     * 
     * This endpoint is for users who registered via Google SSO and want to
     * set a password to enable email/password login. After setting password:
     * - authProvider changes from "google" to "local"
     * - Google SSO login is disabled for this account
     * - User must login with email/password
     */
    @Operation(summary = "Set password for SSO user", description = "Set password for Google SSO user and convert to local authentication")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password set successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error or user not SSO"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @PostMapping("/set-password")
    public ResponseEntity<?> setPasswordForSsoUser(
            @Valid @RequestBody com.DEVision.JobApplicant.auth.internal.dto.SetPasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Authentication required", "success", false),
                    HttpStatus.UNAUTHORIZED
                );
            }

            // Validate password confirmation
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return new ResponseEntity<>(
                    Map.of("message", "Passwords do not match", "success", false),
                    HttpStatus.BAD_REQUEST
                );
            }

            // Get user ID from authenticated user
            User user = userRepository.findByEmail(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(
                    Map.of("message", "User not found", "success", false),
                    HttpStatus.NOT_FOUND
                );
            }

            Map<String, Object> response = authInternalService.setPasswordForSsoUser(
                user.getId(),
                request.getNewPassword(),
                request.getConfirmPassword()
            );

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                // Check if not SSO user
                if (response.containsKey("notSsoUser") && (boolean) response.get("notSsoUser")) {
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error setting password: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to set password: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Change email for authenticated user
     * Requirement 3.1.1: Job Applicants shall be able to edit their Email
     */
    @Operation(summary = "Change email", description = "Change email address for authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid password or email already in use"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "403", description = "SSO users cannot change email")
    })
    @PostMapping("/change-email")
    public ResponseEntity<?> changeEmail(
            @Valid @RequestBody com.DEVision.JobApplicant.auth.internal.dto.ChangeEmailRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Authentication required", "success", false),
                    HttpStatus.UNAUTHORIZED
                );
            }

            // Get user ID from authenticated user
            User user = userRepository.findByEmail(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(
                    Map.of("message", "User not found", "success", false),
                    HttpStatus.NOT_FOUND
                );
            }

            Map<String, Object> response = authInternalService.changeEmail(
                user.getId(),
                request.getNewEmail(),
                request.getCurrentPassword()
            );

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                // Check if SSO user
                if (response.containsKey("isSsoUser") && (boolean) response.get("isSsoUser")) {
                    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
                }
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error changing email: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to change email: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Send OTP to email for verification
     * Used in email change flow
     */
    @Operation(summary = "Send OTP", description = "Send OTP verification code to email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OTP sent successfully"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @Valid @RequestBody com.DEVision.JobApplicant.auth.internal.dto.SendOtpRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Authentication required", "success", false),
                    HttpStatus.UNAUTHORIZED
                );
            }

            Map<String, Object> response = authInternalService.sendOtp(request.getEmail());

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                if (response.containsKey("rateLimited") && (boolean) response.get("rateLimited")) {
                    return new ResponseEntity<>(response, HttpStatus.TOO_MANY_REQUESTS);
                }
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error sending OTP: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to send OTP: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Verify OTP code
     * Used in email change flow
     */
    @Operation(summary = "Verify OTP", description = "Verify OTP code for email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OTP verified successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired OTP"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @Valid @RequestBody com.DEVision.JobApplicant.auth.internal.dto.VerifyOtpRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Authentication required", "success", false),
                    HttpStatus.UNAUTHORIZED
                );
            }

            Map<String, Object> response = authInternalService.verifyOtp(request.getEmail(), request.getOtp());

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error verifying OTP: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to verify OTP: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // ==================== SSO EMAIL CHANGE VIA GOOGLE VERIFICATION ====================

    /**
     * Verify SSO ownership by validating Google ID token matches current email.
     * This is step 1 of the SSO email change flow (alternative to password verification).
     */
    @Operation(summary = "Verify SSO ownership", description = "Verify ownership via Google login for SSO email change")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verification successful, returns verification token"),
        @ApiResponse(responseCode = "400", description = "Email mismatch or invalid token"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @PostMapping("/verify-sso-ownership")
    public ResponseEntity<?> verifySsoOwnership(
            @Valid @RequestBody OAuth2LoginRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Authentication required", "success", false),
                    HttpStatus.UNAUTHORIZED
                );
            }

            // Get user ID from authenticated user
            User user = userRepository.findByEmail(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(
                    Map.of("message", "User not found", "success", false),
                    HttpStatus.NOT_FOUND
                );
            }

            Map<String, Object> response = authInternalService.verifySsoOwnership(
                user.getId(),
                request.getIdToken()
            );

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                if (response.containsKey("emailMismatch") && (boolean) response.get("emailMismatch")) {
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error verifying SSO ownership: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to verify SSO ownership: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Change email for SSO user who verified via Google (not password).
     * This is step 2 of the SSO email change flow.
     */
    @Operation(summary = "Change email for SSO user", description = "Change email using SSO verification (no password required)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email changed successfully"),
        @ApiResponse(responseCode = "400", description = "Verification expired or email already exists"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @PostMapping("/change-email-sso")
    public ResponseEntity<?> changeEmailSso(
            @Valid @RequestBody com.DEVision.JobApplicant.auth.internal.dto.ChangeEmailSsoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Authentication required", "success", false),
                    HttpStatus.UNAUTHORIZED
                );
            }

            // Get user ID from authenticated user
            User user = userRepository.findByEmail(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(
                    Map.of("message", "User not found", "success", false),
                    HttpStatus.NOT_FOUND
                );
            }

            Map<String, Object> response = authInternalService.changeEmailForSsoUser(
                user.getId(),
                request.getNewEmail(),
                request.getOldEmailToken(),
                request.getNewEmailToken()
            );

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error changing email for SSO user: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to change email: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Step 2 of SSO email change: Verify ownership of the NEW email via Google.
     * User must log into the NEW Gmail account to prove they own it.
     */
    @Operation(summary = "Verify new email ownership via Google", 
               description = "Step 2 of SSO email change: Verify the new Gmail by logging into it")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "New email verified, returns newEmailToken"),
        @ApiResponse(responseCode = "400", description = "Email mismatch or already registered"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    @PostMapping("/verify-new-email-ownership")
    public ResponseEntity<?> verifyNewEmailOwnership(
            @Valid @RequestBody com.DEVision.JobApplicant.auth.internal.dto.VerifyNewEmailRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Authentication required", "success", false),
                    HttpStatus.UNAUTHORIZED
                );
            }

            User user = userRepository.findByEmail(userDetails.getUsername());
            if (user == null) {
                return new ResponseEntity<>(
                    Map.of("message", "User not found", "success", false),
                    HttpStatus.NOT_FOUND
                );
            }

            Map<String, Object> response = authInternalService.verifyNewEmailOwnership(
                user.getId(),
                request.getNewEmail(),
                request.getIdToken()
            );

            boolean success = (boolean) response.get("success");
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error verifying new email ownership: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to verify new email: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}

