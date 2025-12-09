package com.DEVision.JobApplicant.auth.internal.dto;

import com.DEVision.JobApplicant.common.validator.ValidEmail;
import jakarta.validation.constraints.NotNull;

/**
 * Internal DTO for forgot password request
 */
public class ForgotPasswordRequest {

    @NotNull(message = "Email is required")
    @ValidEmail
    private String email;

    public ForgotPasswordRequest() {
    }

    public ForgotPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
