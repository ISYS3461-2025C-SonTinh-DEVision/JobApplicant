package com.DEVision.JobApplicant.auth.internal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.DEVision.JobApplicant.applicant.external.dto.ApplicantDto;
import com.DEVision.JobApplicant.applicant.external.dto.CreateApplicantRequest;
import com.DEVision.JobApplicant.applicant.external.service.ApplicantExternalService;
import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.internal.dto.AuthResponse;
import com.DEVision.JobApplicant.auth.internal.dto.LoginRequest;
import com.DEVision.JobApplicant.auth.internal.dto.OAuth2LoginRequest;
import com.DEVision.JobApplicant.auth.internal.dto.OAuth2UserInfo;
import com.DEVision.JobApplicant.auth.internal.dto.RegisterRequest;
import com.DEVision.JobApplicant.auth.internal.dto.RegistrationResponse;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.auth.service.AuthService;
import com.DEVision.JobApplicant.auth.service.OAuth2Service;
import com.DEVision.JobApplicant.common.config.RoleConfig;
import com.DEVision.JobApplicant.common.mail.EmailService;
import com.DEVision.JobApplicant.common.redis.RedisService;
import com.DEVision.JobApplicant.common.sharding.ShardingConfig;
import com.DEVision.JobApplicant.subscription.service.SubscriptionService;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/**
 * Internal service for auth module's own business logic
 * Handles registration, login, activation, password reset
 */
@Service
public class AuthInternalService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ApplicantExternalService applicantExternalService;

    @Autowired
    private OAuth2Service oauth2Service;

    @Autowired
    private RedisService redisService;

    @Autowired
    private SubscriptionService subscriptionService;

    /**
     * Register new user with applicant profile
     */
    @Transactional
    public RegistrationResponse registerUser(RegisterRequest request) {
        // Check if email already exists
        User existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser != null) {
            // Provide specific message if email is registered via SSO
            if ("google".equals(existingUser.getAuthProvider())) {
                return new RegistrationResponse(
                    null, null,
                    request.getEmail(),
                    "This email is already registered via Google SSO. Please sign in with Google, or use a different email to register.",
                    false
                );
            }
            return new RegistrationResponse(
                null, null,
                request.getEmail(),
                "Registration failed: Email already in use",
                false
            );
        }

        // Generate activation token (valid for 15 minutes)
		String activationToken = UUID.randomUUID().toString();

        // Create user
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(RoleConfig.APPLICANT.getRoleName());
        newUser.setEnabled(false);
        newUser.setActivated(false);
        newUser.setActivationToken(activationToken);
		newUser.setActivationTokenExpiry(LocalDateTime.now().plusMinutes(15));

        // Set country and shardId for sharding (Ultimo requirements 1.3.3, A.3.4)
        if (request.getCountry() != null) {
            newUser.setCountry(request.getCountry());
            newUser.setShardId(ShardingConfig.getShardId(request.getCountry()));
        } else {
            // Default to Southeast Asia shard per requirement 4.3.1
            newUser.setShardId(ShardingConfig.ShardRegion.SOUTHEAST_ASIA.getShardId());
        }

        User savedUser = authService.createUser(newUser);

        // Create applicant profile using external service
        CreateApplicantRequest applicantRequest = new CreateApplicantRequest();
        applicantRequest.setUserId(savedUser.getId());
        applicantRequest.setCountry(request.getCountry());
        applicantRequest.setFirstName(request.getFirstName());
        applicantRequest.setLastName(request.getLastName());
        applicantRequest.setPhoneNumber(request.getPhoneNumber());
        applicantRequest.setAddress(request.getAddress());
        applicantRequest.setCity(request.getCity());

        ApplicantDto savedApplicant = applicantExternalService.createApplicant(applicantRequest);

        // Create default freemium subscription for the new user
        subscriptionService.createFreemiumSubscription(savedUser.getId());

        // Send activation email - if this fails, exception will propagate and @Transactional will rollback
        // This ensures user and applicant are not created if email fails
        emailService.sendActivationEmail(savedUser.getEmail(), activationToken);

        return new RegistrationResponse(
            savedUser.getId(),
            savedApplicant.getId(),
            savedUser.getEmail(),
            "Registration successful. Please check your email to activate your account.",
            true
        );
    }

    /**
     * Activate user account
     */
    public Map<String, Object> activateAccount(String token) {
        if (token == null || token.isEmpty()) {
            return Map.of("message", "Activation token is required", "success", false);
        }

        User user = userRepository.findByActivationToken(token);

        if (user == null) {
            return Map.of("message", "Invalid activation token", "success", false);
        }

        if (user.getActivationTokenExpiry().isBefore(LocalDateTime.now())) {
            // Revoke expired token so it cannot be used anymore
            user.setActivationToken(null);
            user.setActivationTokenExpiry(null);
            userRepository.save(user);

            return Map.of("message", "Activation token has expired. Please request a new activation email.", "success", false);
        }

        if (user.isActivated()) {
            return Map.of("message", "Account is already activated. You can now login.", "success", true);
        }

        // Activate the account
        user.setActivated(true);
        user.setEnabled(true);
        user.setActivationToken(null);
        user.setActivationTokenExpiry(null);
        userRepository.save(user);

        return Map.of(
            "message", "Account activated successfully! You can now login.",
            "success", true
        );
    }

    /**
     * Login user and return tokens
     * Implements brute-force protection: max 5 failed attempts in 60 seconds
     */
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Check brute-force protection before processing login
        try {
            if (!redisService.allowLoginAttempt(email)) {
                throw new RuntimeException("Too many failed login attempts. Please try again later.");
            }
        } catch (Exception redisException) {
            // Redis unavailable - log warning and allow login to proceed without rate limiting
            System.out.println("Warning: Redis unavailable, skipping rate limit check during login: " + redisException.getMessage());
        }

        // Find user by email
        User user = userRepository.findByEmail(email);

        if (user == null) {
			throw new RuntimeException("Invalid email or password");
        }

        // SRS Requirement 1.3.2: SSO users cannot use password for direct login
        if ("google".equals(user.getAuthProvider())) {
            throw new RuntimeException("This account is registered with Google SSO. Please sign in with Google.");
        }

        if (!user.isActivated()) {
			// If activation token is missing or expired, generate a new one and resend email
			if (user.getActivationTokenExpiry() == null
					|| user.getActivationTokenExpiry().isBefore(LocalDateTime.now())
					|| user.getActivationToken() == null) {

				String newActivationToken = UUID.randomUUID().toString();
				
				// Try to send email first - only save token if email succeeds
				try {
					emailService.sendActivationEmail(user.getEmail(), newActivationToken);
					// Email sent successfully - now save the token
					user.setActivationToken(newActivationToken);
					// New activation link also valid for 15 minutes
					user.setActivationTokenExpiry(LocalDateTime.now().plusMinutes(15));
					userRepository.save(user);
				} catch (Exception emailException) {
					// Email failed - don't save token, throw error
					throw new RuntimeException("Account not activated and failed to resend activation email. Please try again later.");
				}

				throw new RuntimeException(
						"Your activation link has expired. A new activation email has been sent to your inbox.");
			}

			// Token still valid but account not activated yet
			throw new RuntimeException("Account not activated. Please check your email for activation link.");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled. Please contact support.");
        }

        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        if (!authentication.isAuthenticated()) {
            throw new RuntimeException("Invalid email or password");
        }

        // Reset login attempts on successful authentication
        try {
            redisService.resetLoginAttempts(email);
        } catch (Exception redisException) {
            // Redis unavailable - log warning but allow login to succeed
            System.out.println("Warning: Redis unavailable, unable to reset login attempts: " + redisException.getMessage());
        }

        // Generate tokens
        UserDetails userDetails = authService.loadUserByUsername(email);
        Map<String, String> tokens = authService.createAuthTokens(userDetails, true);

        return new AuthResponse(tokens.get("accessToken"), tokens.get("refreshToken"));
    }

    /**
     * OAuth2 login using ID Token Flow (Google SSO)
     *
     * This method handles both new user registration and existing user login for Google SSO.
     *
     * Flow:
     * 1. Verify the Google ID token via OAuth2Service
     * 2. Check if user exists in database by email
     * 3. If new user: Create User entity + Applicant profile
     * 4. If existing user: Validate account status
     * 5. Generate JWT tokens (access + refresh)
     *
     * New users are automatically:
     * - Activated (enabled=true, isActivated=true) - Google verified the email
     * - Assigned authProvider="google" - enforces SSO-only authentication (SRS 1.3.2)
     * - Given random password - never used, just satisfies entity constraints
     *
     * SRS Requirement 1.3.2: SSO users cannot use password authentication
     * This is enforced in login() method by checking authProvider field
     *
     * @param request OAuth2LoginRequest containing Google ID token
     * @return AuthResponse with JWT access and refresh tokens
     * @throws RuntimeException if token verification fails or account is disabled
     */
    @Transactional
    public AuthResponse oauth2Login(OAuth2LoginRequest request) {
        try {
            // Verify OAuth2 token and get user info (Google only)
            OAuth2UserInfo oauth2UserInfo = oauth2Service.verifyToken(
                request.getIdToken(),
                "google"  // Provider hardcoded since we only support Google
            );

            if (!oauth2UserInfo.isEmailVerified()) {
                throw new RuntimeException("Email not verified by OAuth2 provider");
            }

            // Check if user exists
            User existingUser = userRepository.findByEmail(oauth2UserInfo.getEmail());

            if (existingUser == null) {
                // New user - create account and applicant profile
                User newUser = new User();
                newUser.setEmail(oauth2UserInfo.getEmail());
                // Generate random password for OAuth2 users (won't be used for login)
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                newUser.setRole(RoleConfig.APPLICANT.getRoleName());
                newUser.setEnabled(true); // OAuth2 users are auto-enabled
                newUser.setActivated(true); // OAuth2 users are auto-activated (email verified by provider)
                newUser.setAuthProvider("google"); // SRS 1.3.2: Mark as Google SSO user
                newUser.setActivationToken(null);
                newUser.setActivationTokenExpiry(null);

                User savedUser = authService.createUser(newUser);

                // Create applicant profile with OAuth2 info
                CreateApplicantRequest applicantRequest = new CreateApplicantRequest();
                applicantRequest.setUserId(savedUser.getId());
                applicantRequest.setFirstName(oauth2UserInfo.getGivenName());
                applicantRequest.setLastName(oauth2UserInfo.getFamilyName());
                // Country will be null - user can update later
                applicantRequest.setCountry(null);

                applicantExternalService.createApplicant(applicantRequest);

                // Create default freemium subscription for the new OAuth2 user
                subscriptionService.createFreemiumSubscription(savedUser.getId());

                // Optional: Upload avatar from OAuth2 provider
                // This could be implemented later to fetch and upload the profile picture

                existingUser = savedUser;
            } else {
                // Existing user - check if they've converted to local auth
                // SRS 1.3.2: Users who set password can no longer use Google SSO
                if ("local".equals(existingUser.getAuthProvider())) {
                    throw new RuntimeException(
                        "This account has been converted to email/password login. " +
                        "Google Sign-In is no longer available. Please use your email and password to log in."
                    );
                }
            }

            // Verify user is active
            if (!existingUser.isActivated()) {
                throw new RuntimeException("Account not activated");
            }

            if (!existingUser.isEnabled()) {
                throw new RuntimeException("Account is disabled. Please contact support.");
            }

            // Generate JWT tokens
            UserDetails userDetails = authService.loadUserByUsername(oauth2UserInfo.getEmail());
            Map<String, String> tokens = authService.createAuthTokens(userDetails, true);

            return new AuthResponse(tokens.get("accessToken"), tokens.get("refreshToken"));

        } catch (Exception e) {
            throw new RuntimeException("OAuth2 login failed: " + e.getMessage(), e);
        }
    }

    /**
     * Refresh access token
     */
    public AuthResponse refreshToken(String refreshToken) {
        Map<String, String> tokens = authService.refreshToken(refreshToken);
        return new AuthResponse(tokens.get("accessToken"), tokens.get("refreshToken"));
    }

    /**
     * Request password reset
     */
    public Map<String, Object> forgotPassword(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return Map.of(
                "message", "If an account exists with this email, a password reset link will be sent.",
                "success", true
            );
        }

        // SRS Requirement 1.3.2: SSO users cannot reset password (they don't use passwords)
        if ("google".equals(user.getAuthProvider())) {
            return Map.of(
                "message", "This account uses Google SSO. You cannot reset the password. Please sign in with Google.",
                "success", false
            );
        }

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Send reset email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }

        return Map.of(
            "message", "Password reset link has been sent to your email.",
            "success", true
        );
    }

    /**
     * Reset password using token
     */
    public Map<String, Object> resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token);

        if (user == null) {
            return Map.of("message", "Invalid password reset token", "success", false);
        }

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return Map.of("message", "Password reset token has expired. Please request a new reset link.", "success", false);
        }

        // SRS Requirement 1.3.2: SSO users cannot reset password (they don't use passwords)
        if ("google".equals(user.getAuthProvider())) {
            return Map.of(
                "message", "This account uses Google SSO. Password reset is not allowed. Please sign in with Google.",
                "success", false
            );
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return Map.of(
            "message", "Password has been reset successfully. You can now login with your new password.",
            "success", true
        );
    }

    /**
     * Resend activation email to user
     * @param email User's email address
     * @return Response with success status and message
     */
    public Map<String, Object> resendActivationEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Map.of("message", "Email address is required", "success", false);
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase());

        // User not found - return generic message for security
        if (user == null) {
            return Map.of(
                "message", "If an account exists with this email, a new activation link will be sent.",
                "success", true
            );
        }

        // Already activated
        if (user.isActivated()) {
            return Map.of(
                "message", "This account is already activated. You can login now.",
                "success", true,
                "alreadyActivated", true
            );
        }

        // Generate new activation token
        String newActivationToken = UUID.randomUUID().toString();
        user.setActivationToken(newActivationToken);
        user.setActivationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // Send activation email
        try {
            emailService.sendActivationEmail(user.getEmail(), newActivationToken);
        } catch (Exception e) {
            System.err.println("Failed to send activation email: " + e.getMessage());
            return Map.of(
                "message", "Failed to send activation email. Please try again later.",
                "success", false
            );
        }

        return Map.of(
            "message", "A new activation link has been sent to your email.",
            "success", true
        );
    }

    /**
     * Change password for authenticated user
     * Requirement 3.1.1: Job Applicants shall be able to edit their Password
     * 
     * @param userId User ID from JWT token
     * @param currentPassword Current password for verification
     * @param newPassword New password to set
     * @return Response with success status and message
     */
    public Map<String, Object> changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Map.of("message", "User not found", "success", false);
        }

        // SRS Requirement 1.3.2: SSO users cannot change password
        if ("google".equals(user.getAuthProvider())) {
            return Map.of(
                "message", "This account uses Google SSO. Password change is not allowed. Please manage your password through Google.",
                "success", false,
                "isSsoUser", true
            );
        }

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return Map.of("message", "Current password is incorrect", "success", false);
        }

        // Check if new password is same as current
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return Map.of("message", "New password must be different from current password", "success", false);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return Map.of(
            "message", "Password changed successfully",
            "success", true
        );
    }

    /**
     * Change email for authenticated user
     * Requirement 3.1.1: Job Applicants shall be able to edit their Email
     * 
     * @param userId User ID from JWT token
     * @param newEmail New email address
     * @param currentPassword Current password for verification
     * @return Response with success status and message
     */
    public Map<String, Object> changeEmail(String userId, String newEmail, String currentPassword) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Map.of("message", "User not found", "success", false);
        }

        // SRS Requirement 1.3.2: SSO users need to set password before changing email
        if ("google".equals(user.getAuthProvider())) {
            return Map.of(
                "message", "To change your email, you need to set a password first. Please use the 'Set Password' option in Security Settings to enable email/password login.",
                "success", false,
                "isSsoUser", true,
                "needsPasswordSetup", true
            );
        }

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return Map.of("message", "Password is incorrect", "success", false);
        }

        // Check if new email is same as current
        if (user.getEmail().equalsIgnoreCase(newEmail)) {
            return Map.of("message", "New email must be different from current email", "success", false);
        }

        // Check if new email is already in use
        if (userRepository.existsByEmail(newEmail)) {
            return Map.of("message", "This email address is already in use", "success", false);
        }

        // Update email directly
        String oldEmail = user.getEmail();
        user.setEmail(newEmail);
        userRepository.save(user);

        // Send notification to old email about the change
        try {
            emailService.sendEmailChangeNotification(oldEmail, newEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email change notification: " + e.getMessage());
        }

        return Map.of(
            "message", "Email changed successfully",
            "success", true,
            "newEmail", newEmail
        );
    }

    // ==================== OTP OPERATIONS ====================

    /**
     * Generate and send OTP to email
     * Used for email change verification flow
     * @param email Target email address
     * @return Response with success status
     */
    public Map<String, Object> sendOtp(String email) {
        // Check rate limit
        if (!redisService.allowOtpSend(email)) {
            long remaining = redisService.getRemainingOtpCooldown(email);
            return Map.of(
                "message", "Please wait before requesting another code",
                "success", false,
                "rateLimited", true,
                "retryAfter", remaining
            );
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Store OTP in Redis (5 minute expiry)
        redisService.storeOtp(email, otp, 5);
        
        // Send OTP email
        try {
            emailService.sendOtpEmail(email, otp);
            return Map.of(
                "message", "Verification code sent to " + email,
                "success", true
            );
        } catch (Exception e) {
            return Map.of(
                "message", "Failed to send verification code: " + e.getMessage(),
                "success", false
            );
        }
    }

    /**
     * Verify OTP for email
     * @param email Email address
     * @param otp OTP code to verify
     * @return Response with success status
     */
    public Map<String, Object> verifyOtp(String email, String otp) {
        if (!redisService.verifyOtp(email, otp)) {
            return Map.of(
                "message", "Invalid or expired verification code",
                "success", false
            );
        }

        // Delete OTP after successful verification
        redisService.deleteOtp(email);
        
        return Map.of(
            "message", "Email verified successfully",
            "success", true,
            "verified", true
        );
    }

    // ==================== SSO TO LOCAL AUTH CONVERSION ====================

    /**
     * Set password for SSO user and convert to local authentication.
     * 
     * This method allows users who registered via Google SSO to set a password
     * and switch to email/password login. After this:
     * - authProvider changes from "google" to "local"
     * - Google SSO login is disabled for this account
     * - User must login with email/password going forward
     * 
     * SRS Requirement 1.3.2: SSO users can convert to local auth by setting password
     * 
     * @param userId User ID from JWT token
     * @param newPassword New password to set
     * @param confirmPassword Password confirmation
     * @return Response with success status and message
     */
    public Map<String, Object> setPasswordForSsoUser(String userId, String newPassword, String confirmPassword) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Map.of("message", "User not found", "success", false);
        }

        // Only allow for SSO users
        if (!"google".equals(user.getAuthProvider())) {
            return Map.of(
                "message", "This feature is only for Google SSO users. Please use 'Change Password' instead.",
                "success", false,
                "notSsoUser", true
            );
        }

        // Validate passwords match
        if (!newPassword.equals(confirmPassword)) {
            return Map.of("message", "Passwords do not match", "success", false);
        }

        // Set the new password and convert to local auth
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setAuthProvider("local"); // Convert from "google" to "local"
        userRepository.save(user);

        return Map.of(
            "message", "Password set successfully. You can now login with your email and password. Google login has been disabled for your account.",
            "success", true,
            "authProviderChanged", true
        );
    }

    // ==================== SSO EMAIL CHANGE VIA GOOGLE VERIFICATION ====================

    /**
     * Verify SSO ownership by validating Google ID token matches current user's email.
     * This allows SSO users to change email without setting a password first.
     * 
     * @param userId User ID from JWT token
     * @param idToken Google ID token from frontend
     * @return Response with verification token if successful
     */
    public Map<String, Object> verifySsoOwnership(String userId, String idToken) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Map.of("message", "User not found", "success", false);
        }

        // Only for SSO users
        if (!"google".equals(user.getAuthProvider())) {
            return Map.of(
                "message", "This feature is only for Google SSO users.",
                "success", false
            );
        }

        try {
            // Verify Google ID token
            OAuth2UserInfo oauth2UserInfo = oauth2Service.verifyGoogleIdToken(idToken);
            
            if (oauth2UserInfo == null || oauth2UserInfo.getEmail() == null) {
                return Map.of(
                    "message", "Failed to verify Google account",
                    "success", false
                );
            }

            // Check if token email matches user's current email
            if (!user.getEmail().equalsIgnoreCase(oauth2UserInfo.getEmail())) {
                return Map.of(
                    "message", "Google account does not match your current email. Please use the correct Google account.",
                    "success", false,
                    "emailMismatch", true
                );
            }

            // Generate verification token and store in Redis (10 minute expiry)
            String verificationToken = UUID.randomUUID().toString();
            redisService.storeSsoVerificationToken(userId, verificationToken, 10);

            return Map.of(
                "message", "Google account verified successfully",
                "success", true,
                "verificationToken", verificationToken,
                "verifiedEmail", user.getEmail()
            );

        } catch (Exception e) {
            return Map.of(
                "message", "Failed to verify Google account: " + e.getMessage(),
                "success", false
            );
        }
    }

    /**
     * Change email for SSO user who verified via Google (not password).
     * This allows email change without converting to local auth.
     * Requires verification of BOTH old email AND new email via Google SSO.
     * 
     * @param userId User ID from JWT token
     * @param newEmail New email address
     * @param oldEmailToken Token from verifySsoOwnership (verifies old email)
     * @param newEmailToken Token from verifyNewEmailOwnership (verifies new email)
     * @return Response with success status
     */
    public Map<String, Object> changeEmailForSsoUser(String userId, String newEmail, String oldEmailToken, String newEmailToken) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Map.of("message", "User not found", "success", false);
        }

        // Verify the OLD email SSO verification token from Redis
        if (!redisService.verifySsoVerificationToken(userId, oldEmailToken)) {
            return Map.of(
                "message", "Old email verification expired or invalid. Please verify with Google again.",
                "success", false,
                "oldVerificationInvalid", true
            );
        }

        // Verify the NEW email verification token from Redis
        String storedNewEmailKey = "sso_new_email:" + userId;
        String storedNewEmail = redisService.getValue(storedNewEmailKey);
        String storedNewEmailToken = redisService.getValue("sso_new_email_token:" + userId);
        
        if (storedNewEmailToken == null || !storedNewEmailToken.equals(newEmailToken)) {
            return Map.of(
                "message", "New email verification expired or invalid. Please verify the new email with Google again.",
                "success", false,
                "newVerificationInvalid", true
            );
        }

        // Verify the new email matches what was verified
        if (storedNewEmail == null || !storedNewEmail.equalsIgnoreCase(newEmail)) {
            return Map.of(
                "message", "New email does not match verified email. Please verify the correct email.",
                "success", false
            );
        }

        // Check if new email is same as current
        if (user.getEmail().equalsIgnoreCase(newEmail)) {
            return Map.of("message", "New email must be different from current email", "success", false);
        }

        // Check if new email is already in use by another account
        User existingUser = userRepository.findByEmail(newEmail);
        if (existingUser != null && !existingUser.getId().equals(userId)) {
            return Map.of("message", "This email is already registered. Please use a different email.", "success", false);
        }

        // Update email
        String oldEmail = user.getEmail();
        user.setEmail(newEmail);
        // Keep authProvider as "google" - user can still use Google SSO if new email is a Google account
        userRepository.save(user);

        // Delete all verification tokens after use
        redisService.deleteSsoVerificationToken(userId);
        redisService.deleteKey(storedNewEmailKey);
        redisService.deleteKey("sso_new_email_token:" + userId);

        return Map.of(
            "message", "Email changed successfully from " + oldEmail + " to " + newEmail + ". Please log in with your new email.",
            "success", true,
            "oldEmail", oldEmail,
            "newEmail", newEmail
        );
    }

    /**
     * Verify new email ownership via Google SSO for email change flow.
     * User must log into the NEW Gmail account to prove they own it.
     * 
     * @param userId Current user's ID
     * @param newEmail The new email address user wants to change to
     * @param idToken Google ID token (from logging into NEW Gmail)
     * @return Response with verification token if successful
     */
    public Map<String, Object> verifyNewEmailOwnership(String userId, String newEmail, String idToken) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return Map.of("message", "User not found", "success", false);
        }

        // This is only for Google SSO users
        if (!"google".equals(user.getAuthProvider())) {
            return Map.of(
                "message", "This feature is only for Google SSO users.",
                "success", false
            );
        }

        try {
            // Verify Google ID token and extract email automatically
            OAuth2UserInfo oauth2UserInfo = oauth2Service.verifyGoogleIdToken(idToken);
            
            if (oauth2UserInfo == null || oauth2UserInfo.getEmail() == null) {
                return Map.of(
                    "message", "Failed to verify Google account",
                    "success", false
                );
            }

            // Use email from Google token (user doesn't need to input it manually)
            String verifiedNewEmail = oauth2UserInfo.getEmail();

            // Check new email is different from current
            if (user.getEmail().equalsIgnoreCase(verifiedNewEmail)) {
                return Map.of(
                    "message", "You logged into the same email (" + verifiedNewEmail + "). Please log into a DIFFERENT Google account to change your email.",
                    "success", false,
                    "sameEmail", true
                );
            }

            // Check if new email is already in use
            User existingUser = userRepository.findByEmail(verifiedNewEmail);
            if (existingUser != null && !existingUser.getId().equals(userId)) {
                return Map.of(
                    "message", "The email " + verifiedNewEmail + " is already registered. Please use a different Google account.",
                    "success", false
                );
            }

            // Generate and store verification token for new email
            String verificationToken = UUID.randomUUID().toString();
            
            // Store new email and token in Redis with 10 minute expiry
            redisService.setValue("sso_new_email:" + userId, verifiedNewEmail, 10 * 60);
            redisService.setValue("sso_new_email_token:" + userId, verificationToken, 10 * 60);

            return Map.of(
                "message", "New email verified successfully! You can now complete the email change.",
                "success", true,
                "newEmailToken", verificationToken,
                "verifiedEmail", verifiedNewEmail
            );

        } catch (Exception e) {
            return Map.of(
                "message", "Failed to verify Google account: " + e.getMessage(),
                "success", false
            );
        }
    }
}


