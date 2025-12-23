package com.DEVision.JobApplicant.applicant.internal.dto;

import com.DEVision.JobApplicant.common.model.Country;
import com.DEVision.JobApplicant.common.model.PlanType;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Internal DTO for applicant profile response
 * Used by profile management endpoints
 */
public class ProfileResponse {

    private String id;
    private String userId;
    private String firstName;
    private String lastName;
    private Country country;
    private String phoneNumber;
    private String address;
    private String city;
    private List<EducationResponse> education;
    private List<WorkExperienceResponse> workExperience;
    private List<String> skills;
    private String objectiveSummary;
    private PlanType planType;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProfileResponse() {}

    public ProfileResponse(String id, String userId, String firstName, String lastName,
                          Country country, String phoneNumber, String address, String city,
                          List<EducationResponse> education, List<WorkExperienceResponse> workExperience,
                          List<String> skills, String objectiveSummary, PlanType planType,
                          String avatarUrl, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.country = country;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.city = city;
        this.education = education;
        this.workExperience = workExperience;
        this.skills = skills;
        this.objectiveSummary = objectiveSummary;
        this.planType = planType;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Country getCountry() {
        return country;
    }

    public void setCountry(Country country) {
        this.country = country;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public List<EducationResponse> getEducation() {
        return education;
    }

    public void setEducation(List<EducationResponse> education) {
        this.education = education;
    }

    public List<WorkExperienceResponse> getWorkExperience() {
        return workExperience;
    }

    public void setWorkExperience(List<WorkExperienceResponse> workExperience) {
        this.workExperience = workExperience;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getObjectiveSummary() {
        return objectiveSummary;
    }

    public void setObjectiveSummary(String objectiveSummary) {
        this.objectiveSummary = objectiveSummary;
    }

    public PlanType getPlanType() {
        return planType;
    }

    public void setPlanType(PlanType planType) {
        this.planType = planType;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
