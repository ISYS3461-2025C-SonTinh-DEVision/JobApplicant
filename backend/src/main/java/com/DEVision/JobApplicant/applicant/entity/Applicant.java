package com.DEVision.JobApplicant.applicant.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.DEVision.JobApplicant.common.model.Country;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "applicants")
public class Applicant {

    @Id
    private String id;

    @NotBlank(message = "User ID is required")
    private String userId; // Reference to AuthModel

    // Core fields
    private String firstName;
    private String lastName;

    @NotNull(message = "Country is required")
    private Country country;

    private String phoneNumber;
    private String address;
    private String city;

    // Profile management fields
    @Size(max = 20, message = "Maximum 20 education entries allowed")
    private List<Education> education;

    @Size(max = 20, message = "Maximum 20 work experience entries allowed")
    private List<WorkExperience> workExperience;

    @Size(max = 50, message = "Maximum 50 skills allowed")
    private List<String> skills;

    private String avatarUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Applicant() {
        this.education = new ArrayList<>();
        this.workExperience = new ArrayList<>();
        this.skills = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Applicant(String userId, Country country) {
        this.userId = userId;
        this.country = country;
        this.education = new ArrayList<>();
        this.workExperience = new ArrayList<>();
        this.skills = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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

    public List<Education> getEducation() {
        return education;
    }

    public void setEducation(List<Education> education) {
        this.education = education;
    }

    public List<WorkExperience> getWorkExperience() {
        return workExperience;
    }

    public void setWorkExperience(List<WorkExperience> workExperience) {
        this.workExperience = workExperience;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
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
