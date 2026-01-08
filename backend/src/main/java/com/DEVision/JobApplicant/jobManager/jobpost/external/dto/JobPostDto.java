package com.DEVision.JobApplicant.jobManager.jobpost.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for Job Post data from JM (Job Manager) System
 * Matches the actual API response structure
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobPostDto implements Serializable {
    
    @JsonProperty("uniqueId")
    private String uniqueId;
    
    private String title;
    
    private String description;
    
    @JsonProperty("employmentTypes")
    private List<String> employmentTypes;
    
    @JsonProperty("requiredSkills")
    private List<String> requiredSkills;
    
    @JsonProperty("salaryType")
    private List<String> salaryType;
    
    @JsonProperty("minSalary")
    private Double minSalary;
    
    @JsonProperty("maxSalary")
    private Double maxSalary;
    
    @JsonProperty("salaryCurrency")
    private String salaryCurrency;
    
    @JsonProperty("salaryText")
    private String salaryText;
    
    private String location;
    
    @JsonProperty("postedDate")
    private String postedDate;
    
    @JsonProperty("expiryDate")
    private String expiryDate;
    
    @JsonProperty("isActive")
    private Boolean isActive;
    
    // Company information (from JM API)
    @JsonProperty("companyId")
    private String companyId;
    
    @JsonProperty("companyName")
    private String companyName;
    
    @JsonProperty("logoUrl")
    private String companyLogo;  // Maps to logoUrl from JM API
    
    // Fresher friendly flag
    @JsonProperty("isFresherFriendly")
    private Boolean isFresherFriendly;
    
    // Default constructor
    public JobPostDto() {
    }
    
    // Convenience getter for employmentType (maps to employmentTypes) - not serialized to avoid duplicates
    @JsonIgnore
    public List<String> getEmploymentType() {
        return employmentTypes;
    }
    
    // Convenience getter for skills (maps to requiredSkills) - not serialized to avoid duplicates
    @JsonIgnore
    public List<String> getSkills() {
        return requiredSkills;
    }
    
    // Getters and Setters
    public String getUniqueId() {
        return uniqueId;
    }
    
    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<String> getEmploymentTypes() {
        return employmentTypes;
    }
    
    public void setEmploymentTypes(List<String> employmentTypes) {
        this.employmentTypes = employmentTypes;
    }
    
    public List<String> getRequiredSkills() {
        return requiredSkills;
    }
    
    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }
    
    public List<String> getSalaryType() {
        return salaryType;
    }
    
    public void setSalaryType(List<String> salaryType) {
        this.salaryType = salaryType;
    }
    
    public Double getMinSalary() {
        return minSalary;
    }
    
    public void setMinSalary(Double minSalary) {
        this.minSalary = minSalary;
    }
    
    public Double getMaxSalary() {
        return maxSalary;
    }
    
    public void setMaxSalary(Double maxSalary) {
        this.maxSalary = maxSalary;
    }
    
    public String getSalaryCurrency() {
        return salaryCurrency;
    }
    
    public void setSalaryCurrency(String salaryCurrency) {
        this.salaryCurrency = salaryCurrency;
    }
    
    public String getSalaryText() {
        return salaryText;
    }
    
    public void setSalaryText(String salaryText) {
        this.salaryText = salaryText;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getPostedDate() {
        return postedDate;
    }
    
    public void setPostedDate(String postedDate) {
        this.postedDate = postedDate;
    }
    
    public String getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public String getCompanyId() {
        return companyId;
    }
    
    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getCompanyLogo() {
        return companyLogo;
    }
    
    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }
    
    public Boolean getIsFresherFriendly() {
        return isFresherFriendly;
    }
    
    public void setIsFresherFriendly(Boolean isFresherFriendly) {
        this.isFresherFriendly = isFresherFriendly;
    }
    
    @Override
    public String toString() {
        return "JobPostDto{" +
                "uniqueId='" + uniqueId + '\'' +
                ", title='" + title + '\'' +
                ", location='" + location + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
