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
import com.DEVision.JobApplicant.auth.internal.dto.RegisterRequest;
import com.DEVision.JobApplicant.auth.internal.dto.RegistrationResponse;
import com.DEVision.JobApplicant.auth.internal.dto.ResetPasswordRequest;
import com.DEVision.JobApplicant.auth.internal.service.AuthInternalService;
import com.DEVision.JobApplicant.auth.config.AuthConfig;
import com.DEVision.JobApplicant.common.config.HttpOnlyCookieConfig;
import com.DEVision.JobApplicant.common.service.RedisService;
import com.DEVision.JobApplicant.jwt.JwtUtil;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and authorization endpoints")
class AuthController {

    @Autowired
    private AuthInternalService authInternalService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RedisService redisService;

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
     * Rate limit: 1 request per 60 seconds per email
     */
    @Operation(summary = "Resend activation email", description = "Resend activation email to user with rate limiting (60s cooldown)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Activation email sent or already activated"),
        @ApiResponse(responseCode = "429", description = "Too many requests - rate limited"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @PostMapping("/resend-activation")
    public ResponseEntity<?> resendActivationEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            return new ResponseEntity<>(
                Map.of("message", "Email is required", "success", false),
                HttpStatus.BAD_REQUEST
            );
        }
        
        email = email.trim().toLowerCase();
        
        try {
            // Check rate limit using Redis (60 seconds cooldown)
            String rateLimitKey = "resend_activation:" + email;
            Long ttl = redisService.getRemainingTTL(rateLimitKey);
            
            if (ttl != null && ttl > 0) {
                // Rate limited
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("rateLimited", true);
                response.put("retryAfter", ttl);
                response.put("message", "Please wait " + ttl + " seconds before requesting again.");
                return new ResponseEntity<>(response, HttpStatus.TOO_MANY_REQUESTS);
            }
            
            // Process resend activation
            Map<String, Object> result = authInternalService.resendActivationEmail(email);
            
            boolean success = (boolean) result.get("success");
            boolean alreadyActivated = result.containsKey("alreadyActivated") && (boolean) result.get("alreadyActivated");
            
            if (success && !alreadyActivated) {
                // Set rate limit for 60 seconds
                redisService.setWithExpiry(rateLimitKey, "1", 60);
            }
            
            return new ResponseEntity<>(result, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error resending activation email: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to send activation email. Please try again later.", "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Login endpoint (old implementation - to be updated)
     */
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens in HttpOnly cookies")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials or account not activated")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletResponse response) {
        try {
            AuthResponse authResponse = authInternalService.login(loginRequest);

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
            return new ResponseEntity<>(
                Map.of("message", e.getMessage()),
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
                Map<String, Object> result = new HashMap<>();
                result.put("authenticated", true);
                result.put("username", userDetails.getUsername());
                result.put("roles", userDetails.getAuthorities());

                // Optionally refresh the access token and update cookie
                String newToken = jwtUtil.generateToken(userDetails);
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
     * Resend activation email
     * Rate limited: 1 email per 60 seconds per user
     */
    @Operation(summary = "Resend activation email", description = "Request a new activation email. Rate limited to 1 request per 60 seconds.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Activation email sent"),
        @ApiResponse(responseCode = "429", description = "Too many requests - rate limited")
    })
    @PostMapping("/resend-activation")
    public ResponseEntity<?> resendActivationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            Map<String, Object> response = authInternalService.resendActivationEmail(email);
            
            boolean success = (boolean) response.get("success");
            Boolean rateLimited = (Boolean) response.get("rateLimited");
            
            if (rateLimited != null && rateLimited) {
                return new ResponseEntity<>(response, HttpStatus.TOO_MANY_REQUESTS);
            }
            
            if (success) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error resending activation email: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to send activation email. Please try again later.", "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}

