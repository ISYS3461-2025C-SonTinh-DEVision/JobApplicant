package com.DEVision.JobApplicant.applicant.external.dto;

import com.DEVision.JobApplicant.applicant.internal.dto.EducationResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.PortfolioItemResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.WorkExperienceResponse;
import com.DEVision.JobApplicant.common.country.model.Country;
import com.DEVision.JobApplicant.common.model.PlanType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
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
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant updatedAt;
    
    private String eventType; // "SKILLS_UPDATED" or "COUNTRY_UPDATED"
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant eventTimestamp;

    public ApplicantProfileEvent() {
        this.eventTimestamp = Instant.now();
    }

    public ApplicantProfileEvent(String eventType) {
        this.eventType = eventType;
        this.eventTimestamp = Instant.now();
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    // Helper setter to convert LocalDateTime to Instant
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt != null ? createdAt.toInstant(ZoneOffset.UTC) : null;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Helper setter to convert LocalDateTime to Instant
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt != null ? updatedAt.toInstant(ZoneOffset.UTC) : null;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Instant getEventTimestamp() {
        return eventTimestamp;
    }

    public void setEventTimestamp(Instant eventTimestamp) {
        this.eventTimestamp = eventTimestamp;
    }
}

