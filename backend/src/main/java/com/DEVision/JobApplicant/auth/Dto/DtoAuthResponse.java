package com.DEVision.JobApplicant.auth.Dto;

public class DtoAuthResponse {
    private String accessToken;
    private String refreshToken;

    public DtoAuthResponse() {
    }

    public DtoAuthResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }
} 