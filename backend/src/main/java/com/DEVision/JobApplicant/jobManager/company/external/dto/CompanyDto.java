package com.DEVision.JobApplicant.jobManager.company.external.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * DTO for Company data from JM (Job Manager) System
 * Matches the actual API response structure from GET /api/company
 *
 * Note: JM API has inconsistent field naming (mix of snake_case and camelCase)
 * Using @JsonProperty to handle discrepancies
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyDto implements Serializable {

    @JsonProperty("_id")
    private String id;

    @JsonProperty("uniqueID")  // Note: JM uses "ID" not "Id"
    private String uniqueId;

    private String name;

    private String country;

    private String city;

    private String street;

    @JsonProperty("phoneNumber")
    private String phoneNumber;

    @JsonProperty("logoUrl")
    private String logoUrl;

    @JsonProperty("aboutUs")
    private String aboutUs;

    @JsonProperty("isDeleted")
    private Boolean isDeleted;

    @JsonProperty("createdAt")
    private String createdAt;

    @JsonProperty("updatedAt")
    private String updatedAt;

    @JsonProperty("__v")
    private Integer version;

    // Default constructor
    public CompanyDto() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUniqueId() {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getAboutUs() {
        return aboutUs;
    }

    public void setAboutUs(String aboutUs) {
        this.aboutUs = aboutUs;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return "CompanyDto{" +
                "id='" + id + '\'' +
                ", uniqueId='" + uniqueId + '\'' +
                ", name='" + name + '\'' +
                ", country='" + country + '\'' +
                ", city='" + city + '\'' +
                ", isDeleted=" + isDeleted +
                '}';
    }
}
