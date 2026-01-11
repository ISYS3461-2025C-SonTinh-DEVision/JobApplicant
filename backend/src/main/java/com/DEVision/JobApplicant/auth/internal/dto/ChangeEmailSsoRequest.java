package com.DEVision.JobApplicant.auth.internal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for SSO users to change email using dual Google verification.
 * 
 * This is used in the flow where SSO users verify ownership of BOTH:
 * 1. Old email (via /api/auth/verify-sso-ownership)
 * 2. New email (via /api/auth/verify-new-email-ownership)
 * 
 * Both tokens are required to complete the email change.
 */
public class ChangeEmailSsoRequest {

    @NotBlank(message = "New email is required")
    @Email(message = "Invalid email format")
    private String newEmail;

    @NotBlank(message = "Old email verification token is required")
    private String oldEmailToken;

    @NotBlank(message = "New email verification token is required")
    private String newEmailToken;

    public ChangeEmailSsoRequest() {}

    public ChangeEmailSsoRequest(String newEmail, String oldEmailToken, String newEmailToken) {
        this.newEmail = newEmail;
        this.oldEmailToken = oldEmailToken;
        this.newEmailToken = newEmailToken;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getOldEmailToken() {
        return oldEmailToken;
    }

    public void setOldEmailToken(String oldEmailToken) {
        this.oldEmailToken = oldEmailToken;
    }

    public String getNewEmailToken() {
        return newEmailToken;
    }

    public void setNewEmailToken(String newEmailToken) {
        this.newEmailToken = newEmailToken;
    }
}
