package com.DEVision.JobApplicant.auth.internal.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for OAuth2 login requests
 * Contains the authorization code or access token from OAuth2 provider
 */
public class OAuth2LoginRequest {

    @NotBlank(message = "ID token is required")
    private String idToken;

    private String provider; // "google", "facebook", etc.

    public OAuth2LoginRequest() {}

    public OAuth2LoginRequest(String idToken, String provider) {
        this.idToken = idToken;
        this.provider = provider;
    }

    // Getters and Setters
    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}
