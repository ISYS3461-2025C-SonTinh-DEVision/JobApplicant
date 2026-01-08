package com.DEVision.JobApplicant.auth.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.DEVision.JobApplicant.common.country.model.Country;
import com.DEVision.JobApplicant.common.model.PlanType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Document(collection = "account")
public class User {
    @Id
    @NotBlank(message = "ID cannot be blank")
    private String id;

    @NotBlank(message = "Email is required.")
    @Email(regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.(com|vn)$",
        message = "Invalid email format. The email must end with '.com' or '.vn' (e.g., example@domain.com).")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$",
             message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (e.g., P@sswOrd1).")
    private String password;

    @NotNull
    private boolean enabled;

    @NotBlank(message = "Role cannot be blank, either registered users or non-registered users")
    private String role;

    @NotNull(message = "Plan type is required")
    private PlanType planType;

    private Country country;

    // Account activation fields
    private boolean isActivated;
    private String activationToken;
    private LocalDateTime activationTokenExpiry;

    // Password reset fields
    private String passwordResetToken;
    private LocalDateTime passwordResetTokenExpiry;

    // Authentication provider: "local" for email/password, "google" for Google SSO
    // SRS Requirement 1.3.2: SSO users cannot use password for direct login
    private String authProvider;

    public User(String username, String password, String role, boolean enabled) {
        this.email = username;
        this.password = password;
        this.enabled = enabled;
        this.role = role;
        this.planType = PlanType.FREEMIUM;
        this.isActivated = false;
        this.authProvider = "local"; // Default to local authentication
    }

    public User() {
        this.planType = PlanType.FREEMIUM;
        this.isActivated = false;
        this.authProvider = "local"; // Default to local authentication
    }

    public String getId() {
        return id;
    }
    public String getEmail() {
        return email;
    }
    public String getPassword() {
        return password;
    }
    public boolean isEnabled() {
        return enabled;
    }
    public String getRole() {
        return role;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public PlanType getPlanType() {
        return planType;
    }

    public void setPlanType(PlanType planType) {
        this.planType = planType;
    }

    public boolean isActivated() {
        return isActivated;
    }

    public void setActivated(boolean activated) {
        isActivated = activated;
    }

    public String getActivationToken() {
        return activationToken;
    }

    public void setActivationToken(String activationToken) {
        this.activationToken = activationToken;
    }

    public LocalDateTime getActivationTokenExpiry() {
        return activationTokenExpiry;
    }

    public void setActivationTokenExpiry(LocalDateTime activationTokenExpiry) {
        this.activationTokenExpiry = activationTokenExpiry;
    }

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public LocalDateTime getPasswordResetTokenExpiry() {
        return passwordResetTokenExpiry;
    }

    public void setPasswordResetTokenExpiry(LocalDateTime passwordResetTokenExpiry) {
        this.passwordResetTokenExpiry = passwordResetTokenExpiry;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public Country getCountry() {
        return country;
    }

    public void setCountry(Country country) {
        this.country = country;
    }
}
