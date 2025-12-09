package com.DEVision.JobApplicant.applicant.internal.dto;

import com.DEVision.JobApplicant.common.model.Country;

/**
 * Internal DTO for updating applicant profile
 * Used by profile management endpoints
 */
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;
    private Country country;
    private String phoneNumber;
    private String address;
    private String city;

    public UpdateProfileRequest() {}

    // Getters and Setters
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
}
