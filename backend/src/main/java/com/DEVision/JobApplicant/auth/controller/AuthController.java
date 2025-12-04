package com.DEVision.JobApplicant.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import com.DEVision.JobApplicant.auth.Dto.DtoAuthResponse;
import com.DEVision.JobApplicant.auth.Dto.DtoLogin;
import com.DEVision.JobApplicant.auth.Dto.DtoRefreshToken;
import com.DEVision.JobApplicant.auth.Dto.DtoRegistration;
import com.DEVision.JobApplicant.auth.Dto.DtoRegistrationResponse;
import com.DEVision.JobApplicant.auth.Dto.DtoForgotPassword;
import com.DEVision.JobApplicant.auth.Dto.DtoResetPassword;
import com.DEVision.JobApplicant.auth.config.AuthConfig;
import com.DEVision.JobApplicant.auth.model.AuthModel;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.auth.service.AuthService;
import com.DEVision.JobApplicant.common.config.HttpOnlyCookieConfig;
import com.DEVision.JobApplicant.common.config.RoleConfig;
import com.DEVision.JobApplicant.common.service.EmailService;
import com.DEVision.JobApplicant.applicant.model.Applicant;
import com.DEVision.JobApplicant.applicant.service.ApplicantService;
import com.DEVision.JobApplicant.jwt.JwtUtil;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "https://localhost:3000")
@Tag(name = "Authentication", description = "User authentication and authorization endpoints")
class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuthService userService;

    @Autowired
    private AuthRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private com.DEVision.JobApplicant.common.service.RedisService redisService;

@Operation(summary = "Register new user", description = "Create a new applicant account with email activation")
@ApiResponses(value = {
    @ApiResponse(responseCode = "201", description = "Registration successful, activation email sent"),
    @ApiResponse(responseCode = "409", description = "Email already in use"),
    @ApiResponse(responseCode = "400", description = "Invalid input or registration failed")
})
@PostMapping("/register")
@Transactional
public ResponseEntity<DtoRegistrationResponse> registerUser(@Valid @RequestBody DtoRegistration registrationDto) {
    try {
        // Check if email already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new DtoRegistrationResponse(
                            null, null,
                            registrationDto.getEmail(),
                            "Registration failed: Email already in use",
                            false
                    ));
        }

        // Generate activation token
        String activationToken = UUID.randomUUID().toString();

        // Create user
        AuthModel newUser = new AuthModel();
        newUser.setEmail(registrationDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        newUser.setRole(RoleConfig.APPLICANT.getRoleName());
        newUser.setEnabled(false);
        newUser.setActivated(false);
        newUser.setActivationToken(activationToken);
        newUser.setActivationTokenExpiry(LocalDateTime.now().plusHours(24));

        AuthModel savedUser = userService.createUser(newUser);

        // Create applicant profile
        Applicant applicant = new Applicant();
        applicant.setUserId(savedUser.getId());
        applicant.setCountry(registrationDto.getCountry());
        applicant.setPhoneNumber(registrationDto.getPhoneNumber());
        applicant.setAddress(registrationDto.getAddress());
        applicant.setCity(registrationDto.getCity());

        Applicant savedApplicant = applicantService.createApplicant(applicant);

        // Send activation email AND fail if email fails
        try {
            emailService.sendActivationEmail(savedUser.getEmail(), activationToken);
        } catch (Exception emailException) {
            throw new RuntimeException("Failed to send activation email", emailException);
        }

        // All good
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new DtoRegistrationResponse(
                        savedUser.getId(),
                        savedApplicant.getId(),
                        savedUser.getEmail(),
                        "Registration successful. Please check your email to activate your account.",
                        true
                ));

    } catch (Exception e) {
        // Rollback (because of @Transactional)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new DtoRegistrationResponse(
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
    public ResponseEntity<?> activateAccount(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            
            if (token == null || token.isEmpty()) {
                return new ResponseEntity<>(
                    Map.of("message", "Activation token is required", "success", false),
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Find user by activation token
            AuthModel user = userRepository.findByActivationToken(token);
            
            if (user == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Invalid activation token", "success", false),
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Check if token has expired
            if (user.getActivationTokenExpiry().isBefore(LocalDateTime.now())) {
                return new ResponseEntity<>(
                    Map.of("message", "Activation token has expired. Please request a new activation email.", "success", false),
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Check if already activated
            if (user.isActivated()) {
                return new ResponseEntity<>(
                    Map.of("message", "Account is already activated. You can now login.", "success", true),
                    HttpStatus.OK
                );
            }
            
            // Activate the account
            user.setActivated(true);
            user.setEnabled(true); // Enable login
            user.setActivationToken(null); // Clear the token
            user.setActivationTokenExpiry(null);
            userRepository.save(user);
            
            return new ResponseEntity<>(
                Map.of("message", "Account activated successfully! You can now login.", "success", true),
                HttpStatus.OK
            );
            
        } catch (Exception e) {
            System.err.println("Error activating account: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to activate account: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens with brute-force protection")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "403", description = "Account not activated"),
        @ApiResponse(responseCode = "429", description = "Too many login attempts (rate limited)")
    })
    @PostMapping("/login")
    public ResponseEntity<DtoAuthResponse> login(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody DtoLogin loginDto
    ) {
        String username = loginDto.getEmail();
        String password = loginDto.getPassword();

        try {
            // Brute-force protection: Check rate limit (5 attempts per 60 seconds)
            if (!redisService.allowLoginAttempt(username)) {
                long attempts = redisService.getLoginAttempts(username);
                return new ResponseEntity<>(
                    new DtoAuthResponse("Too many login attempts (" + attempts + "/5). Please try again in 60 seconds.", "N/A"),
                    HttpStatus.TOO_MANY_REQUESTS
                );
            }

            // Check if account is activated
            AuthModel user = userRepository.findByEmail(username);
            if (user != null && !user.isActivated()) {
                return new ResponseEntity<>(
                    new DtoAuthResponse("Account not activated. Please check your email for activation link.", "N/A"),
                    HttpStatus.FORBIDDEN
                );
            }
            
            UsernamePasswordAuthenticationToken credentialToken 
                = new UsernamePasswordAuthenticationToken(
                    username, 
                    password 
                );           
                                       
            long startTime = System.currentTimeMillis();

            Authentication token = authenticationManager.authenticate(credentialToken);

            long duration = System.currentTimeMillis() - startTime;

            System.out.println("Authentication Duration: " + duration + "ms");

            System.out.println("User Authenticated: " + token.isAuthenticated());

            if (token.isAuthenticated()) {
                // Reset login attempts on successful authentication
                redisService.resetLoginAttempts(username);

                Map<String, String> tokens = userService.createAuthTokens(
                    (UserDetails) token.getPrincipal(),
                    token.isAuthenticated()
                );

                String accessToken = tokens.get("accessToken");
                String refreshToken = tokens.get("refreshToken");

                DtoAuthResponse responseDto = new DtoAuthResponse(accessToken, refreshToken);

                // Create access token cookie
                Cookie accessCookie = HttpOnlyCookieConfig.createCookie(
                    AuthConfig.AUTH_COOKIE_NAME, 
                    accessToken
                );
                
                // Create refresh token cookie with longer expiration
                Cookie refreshCookie = HttpOnlyCookieConfig.createCookie(
                    AuthConfig.REFRESH_COOKIE_NAME, 
                    refreshToken
                );
                refreshCookie.setMaxAge(86400 * 7); // 7 days
                
                response.addCookie(accessCookie);
                response.addCookie(refreshCookie);
    
                System.out.println("User Auth Successful " + accessToken);
    
                return new ResponseEntity<>(responseDto, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                    new DtoAuthResponse("N/A", "N/A"), 
                    HttpStatus.UNAUTHORIZED
                );
            }
        } catch (Exception e) {
            System.err.println("Error when logging in: " + e.getMessage());
            return new ResponseEntity<>(
                new DtoAuthResponse("N/A", "N/A"), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    @Operation(summary = "Refresh access token", description = "Get a new access token using refresh token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<DtoAuthResponse> refreshToken(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody DtoRefreshToken refreshTokenDto
    ) {
        try {
            Map<String, String> tokens = userService.refreshToken(refreshTokenDto.getRefreshToken());
            
            String newAccessToken = tokens.get("accessToken");
            String currentRefreshToken = tokens.get("refreshToken");
            
            // Update the access token cookie
            Cookie accessCookie = HttpOnlyCookieConfig.createCookie(
                AuthConfig.AUTH_COOKIE_NAME, 
                newAccessToken
            );
            
            response.addCookie(accessCookie);
            
            return new ResponseEntity<>(
                new DtoAuthResponse(newAccessToken, currentRefreshToken),
                HttpStatus.OK
            );
        } catch (Exception e) {
            System.err.println("Error refreshing token: " + e.getMessage());
            return new ResponseEntity<>(
                new DtoAuthResponse("N/A", "N/A"), 
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    /**
     * Endpoint to check if the user is authenticated and has a valid session.
     * Also refreshes the token if it's close to expiring.
     */
    @Operation(summary = "Check session", description = "Verify if user session is valid and refresh token if needed")
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
        if (userDetails != null) {
            try {
                // Look for access token cookie
                Cookie[] cookies = request.getCookies();
                String accessToken = null;
                
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if (AuthConfig.AUTH_COOKIE_NAME.equals(cookie.getName())) {
                            accessToken = cookie.getValue();
                            break;
                        }
                    }
                }
                
                Map<String, Object> result = new HashMap<>();
                
                // If we found a token, check if it needs to be refreshed
                if (accessToken != null) {
                    // Return the token for client-side extraction of user info
                    result.put("token", accessToken);
                    
                    // Always generate a new token for simplicity
                    // This approach avoids needing to check expiration directly
                    String newToken = jwtUtil.generateToken(userDetails);
                    
                    // Update the cookie
                    Cookie newCookie = HttpOnlyCookieConfig.createCookie(
                        AuthConfig.AUTH_COOKIE_NAME, 
                        newToken
                    );
                    response.addCookie(newCookie);
                    
                    // Return the new token
                    result.put("token", newToken);
                    
                    return new ResponseEntity<>(result, HttpStatus.OK);
                }
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

            // Blacklist tokens in Redis (prevent reuse)
            if (accessToken != null && !accessToken.isEmpty()) {
                redisService.blacklistToken(accessToken, 1440); // 24 hours (match token expiry)
            }
            if (refreshToken != null && !refreshToken.isEmpty()) {
                redisService.blacklistToken(refreshToken, 10080); // 7 days (match refresh token expiry)
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
        @ApiResponse(responseCode = "404", description = "Email not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody DtoForgotPassword forgotPasswordDto) {
        try {
            AuthModel user = userRepository.findByEmail(forgotPasswordDto.getEmail());

            if (user == null) {
                // Return success even if user not found (security best practice - don't reveal if email exists)
                return new ResponseEntity<>(
                    Map.of("message", "If an account exists with this email, a password reset link has been sent.", "success", true),
                    HttpStatus.OK
                );
            }

            // Generate password reset token
            String resetToken = UUID.randomUUID().toString();
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1)); // 1 hour expiry
            userRepository.save(user);

            // Send password reset email
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
            } catch (Exception emailException) {
                System.err.println("Failed to send password reset email: " + emailException.getMessage());
                return new ResponseEntity<>(
                    Map.of("message", "Failed to send reset email. Please try again later.", "success", false),
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return new ResponseEntity<>(
                Map.of("message", "If an account exists with this email, a password reset link has been sent.", "success", true),
                HttpStatus.OK
            );

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
    public ResponseEntity<?> resetPassword(@Valid @RequestBody DtoResetPassword resetPasswordDto) {
        try {
            AuthModel user = userRepository.findByPasswordResetToken(resetPasswordDto.getToken());

            if (user == null) {
                return new ResponseEntity<>(
                    Map.of("message", "Invalid reset token", "success", false),
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check if token has expired
            if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
                return new ResponseEntity<>(
                    Map.of("message", "Reset token has expired. Please request a new password reset.", "success", false),
                    HttpStatus.BAD_REQUEST
                );
            }

            // Update password
            user.setPassword(passwordEncoder.encode(resetPasswordDto.getNewPassword()));
            user.setPasswordResetToken(null); // Clear the token
            user.setPasswordResetTokenExpiry(null);
            userRepository.save(user);

            return new ResponseEntity<>(
                Map.of("message", "Password reset successful! You can now login with your new password.", "success", true),
                HttpStatus.OK
            );

        } catch (Exception e) {
            System.err.println("Error resetting password: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("message", "Failed to reset password: " + e.getMessage(), "success", false),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
