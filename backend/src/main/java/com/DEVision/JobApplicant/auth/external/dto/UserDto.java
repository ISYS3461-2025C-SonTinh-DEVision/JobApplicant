package com.DEVision.JobApplicant.auth.external.dto;

/**
 * External DTO for user data
 * Used by other modules to get user information
 */
public class UserDto {

    private String id;
    private String email;
    private String role;
    private boolean enabled;
    private boolean isActivated;

    public UserDto() {}

    public UserDto(String id, String email, String role, boolean enabled, boolean isActivated) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.enabled = enabled;
        this.isActivated = isActivated;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isActivated() {
        return isActivated;
    }

    public void setActivated(boolean activated) {
        isActivated = activated;
    }
}
