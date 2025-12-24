package com.DEVision.JobApplicant.auth.internal.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for OAuth2 callback requests (Authorization Code Flow)
 * Contains the authorization code received from OAuth2 provider
 */
public class OAuth2CallbackRequest {

    @NotBlank(message = "Authorization code is required")
    private String code;

    public OAuth2CallbackRequest() {}

    public OAuth2CallbackRequest(String code) {
        this.code = code;
    }

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
