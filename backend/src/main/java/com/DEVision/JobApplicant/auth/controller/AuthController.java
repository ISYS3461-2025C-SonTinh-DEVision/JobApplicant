package com.DEVision.JobApplicant.auth.controller;

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

    @PostMapping("/login")
    public ResponseEntity<DtoAuthResponse> login(
        HttpServletRequest request, 
        HttpServletResponse response,
        @RequestBody DtoLogin loginDto
    ) {
        String username = loginDto.getEmail();
        String password = loginDto.getPassword();

        try {
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
     * Endpoint to logout user by clearing auth cookies
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
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
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        // Try to get token from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // Check cookies if header is not available
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }
}
