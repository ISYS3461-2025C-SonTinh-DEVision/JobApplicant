package com.DEVision.JobApplicant.auth.internal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for verifying new email ownership via Google SSO.
 * 
 * User must log into their NEW Gmail account to prove they own it.
 * The idToken comes from Google after successful login to the new email.
 */
public class VerifyNewEmailRequest {

    @NotBlank(message = "New email is required")
    @Email(message = "Invalid email format")
    private String newEmail;

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    public VerifyNewEmailRequest() {}

    public VerifyNewEmailRequest(String newEmail, String idToken) {
        this.newEmail = newEmail;
        this.idToken = idToken;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
