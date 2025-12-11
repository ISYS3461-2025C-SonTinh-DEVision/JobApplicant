package com.DEVision.JobApplicant.auth.internal.dto;

import com.DEVision.JobApplicant.common.validator.ValidPassword;
import jakarta.validation.constraints.NotNull;

/**
 * Internal DTO for reset password request
 */
public class ResetPasswordRequest {

    @NotNull(message = "Token is required")
    private String token;

    @NotNull(message = "New password is required")
    @ValidPassword
    private String newPassword;

    public ResetPasswordRequest() {
    }

    public ResetPasswordRequest(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
