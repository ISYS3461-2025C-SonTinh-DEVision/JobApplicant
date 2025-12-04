package com.DEVision.JobApplicant.auth.Dto;

public class DtoRefreshToken {
    private String refreshToken;

    public DtoRefreshToken() {
    }

    public DtoRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
} 