package com.DEVision.JobApplicant.jmintegration.jobpost.external.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * DTO for single Job Post response from JM system
 * Matches the actual API response structure:
 * {
 *   "statusCode": 200,
 *   "message": "...",
 *   "data": { ... }
 * }
 */
public class JobPostSingleResponse implements Serializable {
    
    @JsonProperty("statusCode")
    private Integer statusCode;
    
    private String message;
    
    private JobPostDto data;
    
    public JobPostSingleResponse() {
    }
    
    // Convenience method to get the job post directly
    public JobPostDto getJobPost() {
        return data;
    }
    
    // Getters and Setters
    public Integer getStatusCode() {
        return statusCode;
    }
    
    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public JobPostDto getData() {
        return data;
    }
    
    public void setData(JobPostDto data) {
        this.data = data;
    }
}

