package com.DEVision.JobApplicant.auth.internal.dto;

/**
 * DTO to store user information from OAuth2 providers (Google, Facebook, etc.)
 */
public class OAuth2UserInfo {

    private String id;
    private String email;
    private String name;
    private String givenName;
    private String familyName;
    private String picture;
    private String provider;
    private boolean emailVerified;

    public OAuth2UserInfo() {}

    public OAuth2UserInfo(String id, String email, String name, String givenName,
                         String familyName, String picture, String provider, boolean emailVerified) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.givenName = givenName;
        this.familyName = familyName;
        this.picture = picture;
        this.provider = provider;
        this.emailVerified = emailVerified;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGivenName() {
        return givenName;
    }

    public void setGivenName(String givenName) {
        this.givenName = givenName;
    }

    public String getFamilyName() {
        return familyName;
    }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
