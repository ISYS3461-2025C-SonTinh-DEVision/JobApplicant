package com.DEVision.JobApplicant.subscription.dto;

public record JMLoginResponse(
        int statusCode,
        String message,
        LoginData data
) {
    public record LoginData(
            String accessToken,
            String refreshToken,
            int expiresIn,
            UserInfo user
    ) {}

    public record UserInfo(
            String uniqueID,
            String email,
            String role,
            String companyId,
            boolean isActive
    ) {}

    public String getAccessToken() {
        return data != null ? data.accessToken() : null;
    }
}

