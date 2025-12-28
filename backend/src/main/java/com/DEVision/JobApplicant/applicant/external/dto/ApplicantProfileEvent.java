package com.DEVision.JobApplicant.applicant.external.dto;

import com.DEVision.JobApplicant.applicant.internal.dto.EducationResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.PortfolioItemResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.WorkExperienceResponse;
import com.DEVision.JobApplicant.common.country.model.Country;
import com.DEVision.JobApplicant.common.model.PlanType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for applicant profile event payload sent to Kafka
 * Contains all profile information when skills or country are updated
 */
public class ApplicantProfileEvent {

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
    private List<PortfolioItemResponse> portfolioImages;
    private List<PortfolioItemResponse> portfolioVideos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String eventType; // "SKILLS_UPDATED" or "COUNTRY_UPDATED"
    private LocalDateTime eventTimestamp;

    public ApplicantProfileEvent() {
        this.eventTimestamp = LocalDateTime.now();
    }

    public ApplicantProfileEvent(String eventType) {
        this.eventType = eventType;
        this.eventTimestamp = LocalDateTime.now();
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

    public List<PortfolioItemResponse> getPortfolioImages() {
        return portfolioImages;
    }

    public void setPortfolioImages(List<PortfolioItemResponse> portfolioImages) {
        this.portfolioImages = portfolioImages;
    }

    public List<PortfolioItemResponse> getPortfolioVideos() {
        return portfolioVideos;
    }

    public void setPortfolioVideos(List<PortfolioItemResponse> portfolioVideos) {
        this.portfolioVideos = portfolioVideos;
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

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getEventTimestamp() {
        return eventTimestamp;
    }

    public void setEventTimestamp(LocalDateTime eventTimestamp) {
        this.eventTimestamp = eventTimestamp;
    }
}

