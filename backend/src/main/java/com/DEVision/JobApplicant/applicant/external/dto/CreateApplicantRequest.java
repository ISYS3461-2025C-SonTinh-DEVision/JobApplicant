package com.DEVision.JobApplicant.applicant.external.dto;

import com.DEVision.JobApplicant.common.country.model.Country;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * External DTO for creating an applicant
 * Used by other modules (like auth) to create applicant profiles
 */
public class CreateApplicantRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Country is required")
    private Country country;

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String city;

    public CreateApplicantRequest() {}

    public CreateApplicantRequest(String userId, Country country) {
        this.userId = userId;
        this.country = country;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Country getCountry() {
        return country;
    }

    public void setCountry(Country country) {
        this.country = country;
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
}
