package com.DEVision.JobApplicant.auth.internal.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for OAuth2 login requests using ID Token Flow
 *
 * This DTO is used for Google SSO authentication via ID Token Flow:
 * - Frontend obtains Google ID token using Google Identity Services SDK
 * - Frontend sends the ID token to backend via POST /api/auth/oauth2/login
 * - Backend verifies token and creates/logs in the user
 *
 * Currently only supports Google OAuth2.
 * Provider field removed for simplicity (was previously "google", "facebook", etc.)
 *
 * @see com.DEVision.JobApplicant.auth.service.OAuth2Service#verifyGoogleIdToken
 */
public class OAuth2LoginRequest {

    @NotBlank(message = "ID token is required")
    private String idToken;

    public OAuth2LoginRequest() {}

    public OAuth2LoginRequest(String idToken) {
        this.idToken = idToken;
    }

    // Getter and Setter
    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
