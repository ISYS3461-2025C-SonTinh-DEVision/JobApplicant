package com.DEVision.JobApplicant.auth.Dto;

import com.DEVision.JobApplicant.common.validator.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public class DtoResetPassword {

    @NotBlank(message = "Token is required")
    private String token;

    @NotBlank(message = "Password is required")
    @ValidPassword
    private String newPassword;

    public DtoResetPassword() {}

    public DtoResetPassword(String token, String newPassword) {
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
