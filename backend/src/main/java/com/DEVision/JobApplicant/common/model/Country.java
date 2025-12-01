package com.DEVision.JobApplicant.common.model;

public enum Country {
    SINGAPORE("Singapore", "SG"),
    VIETNAM("Vietnam", "VN");

    private final String displayName;
    private final String code;

    Country(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCode() {
        return code;
    }

    @Override
    public String toString() {
        return displayName;
    }
}

