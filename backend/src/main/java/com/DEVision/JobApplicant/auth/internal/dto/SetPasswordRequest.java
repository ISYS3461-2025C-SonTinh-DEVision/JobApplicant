package com.DEVision.JobApplicant.auth.internal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for SSO users to set their password and convert to local authentication.
 * 
 * This endpoint is only for users who registered via Google SSO and want to
 * switch to email/password login. After setting password:
 * - authProvider changes from "google" to "local"
 * - Google SSO login is disabled for this account
 * - User must login with email/password
 * 
 * SRS Requirement 1.3.2: SSO users can convert to local auth by setting password
 */
public class SetPasswordRequest {

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$",
             message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
    private String newPassword;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    public SetPasswordRequest() {}

    public SetPasswordRequest(String newPassword, String confirmPassword) {
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
