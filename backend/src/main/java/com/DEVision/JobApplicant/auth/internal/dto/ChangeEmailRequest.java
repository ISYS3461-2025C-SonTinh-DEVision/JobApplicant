package com.DEVision.JobApplicant.auth.internal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for email change request
 * Requirement 3.1.1: Job Applicants shall be able to edit their Email and Password
 */
public class ChangeEmailRequest {

    @NotBlank(message = "New email is required")
    @Email(
        regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message = "Invalid email format"
    )
    @Size(max = 254, message = "Email must be less than 255 characters")
    private String newEmail;

    @NotBlank(message = "Current password is required for verification")
    private String currentPassword;

    public ChangeEmailRequest() {}

    public ChangeEmailRequest(String newEmail, String currentPassword) {
        this.newEmail = newEmail;
        this.currentPassword = currentPassword;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
}
