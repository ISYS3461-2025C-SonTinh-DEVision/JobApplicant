package com.DEVision.JobApplicant.common.config;

public enum RoleConfig {
    APPLICANT("APPLICANT"),
    COMPANY("COMPANY"),
    ADMIN("ADMIN"),
    GUEST("GUEST");

    private final String roleName;

    RoleConfig(String roleName) {
        this.roleName = roleName;
    }

    public String getRoleName() {
        return roleName;
    }
}
