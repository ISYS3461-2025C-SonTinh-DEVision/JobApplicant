package com.DEVision.JobApplicant.auth.Dto;

import com.DEVision.JobApplicant.common.model.Country;
import com.DEVision.JobApplicant.common.validator.ValidEmail;
import com.DEVision.JobApplicant.common.validator.ValidPassword;
import com.DEVision.JobApplicant.common.validator.ValidPhoneNumber;

import jakarta.validation.constraints.NotNull;

public class DtoRegistration {
    // Mandatory fields
    @NotNull(message = "Email is required")
    @ValidEmail
    private String email;
    
    @NotNull(message = "Password is required")
    @ValidPassword
    private String password;
    
    @NotNull(message = "Country is required")
    private Country country;
    
    // Optional fields
    private String firstName;
    private String lastName;
    
    @ValidPhoneNumber(optional = true)
    private String phoneNumber;
    
    private String address;
    private String city;

    // Default constructor
    public DtoRegistration() {
    }

    // Getters and setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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