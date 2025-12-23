package com.DEVision.JobApplicant.common.model;

public enum PlanType {
    FREEMIUM("Freemium", "Free tier with basic features"),
    PREMIUM("Premium", "Premium tier with advanced features");

    private final String displayName;
    private final String description;

    PlanType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
