package com.DEVision.JobApplicant.subscription.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.DEVision.JobApplicant.subscription.EmploymentType;

@Document(collection = "search_profiles")
public class SearchProfile {

    @Id
    private String id;

    private String userId;
    private String profileName;
    private List<String> desiredSkills;
    private List<EmploymentType> employmentTypes;
    private List<String> jobTitles;
    private String desiredCountry;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    public SearchProfile() {
    }

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

    public String getProfileName() {
        return profileName;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public List<String> getDesiredSkills() {
        return desiredSkills;
    }

    public void setDesiredSkills(List<String> desiredSkills) {
        this.desiredSkills = desiredSkills;
    }

    public List<EmploymentType> getEmploymentTypes() {
        return employmentTypes;
    }

    public void setEmploymentTypes(List<EmploymentType> employmentTypes) {
        this.employmentTypes = employmentTypes;
    }

    public List<String> getJobTitles() {
        return jobTitles;
    }

    public void setJobTitles(List<String> jobTitles) {
        this.jobTitles = jobTitles;
    }

    public String getDesiredCountry() {
        return desiredCountry;
    }

    public void setDesiredCountry(String desiredCountry) {
        this.desiredCountry = desiredCountry;
    }

    public BigDecimal getMinSalary() {
        return minSalary;
    }

    public void setMinSalary(BigDecimal minSalary) {
        this.minSalary = minSalary;
    }

    public BigDecimal getMaxSalary() {
        return maxSalary;
    }

    public void setMaxSalary(BigDecimal maxSalary) {
        this.maxSalary = maxSalary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

