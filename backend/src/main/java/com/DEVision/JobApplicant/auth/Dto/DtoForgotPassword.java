package com.DEVision.JobApplicant.auth.Dto;

import com.DEVision.JobApplicant.common.validator.ValidEmail;
import jakarta.validation.constraints.NotBlank;

public class DtoForgotPassword {

    @NotBlank(message = "Email is required")
    @ValidEmail
    private String email;

    public DtoForgotPassword() {}

    public DtoForgotPassword(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
