package com.DEVision.JobApplicant.auth.Dto;

public class DtoRegistrationResponse {
    private String userId;
    private String applicantId;
    private String email;
    private String message;
    private boolean success;
    
    public DtoRegistrationResponse() {
    }
    
    public DtoRegistrationResponse(String userId, String applicantId, String email, String message, boolean success) {
        this.userId = userId;
        this.applicantId = applicantId;
        this.email = email;
        this.message = message;
        this.success = success;
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getApplicantId() {
        return applicantId;
    }
    
    public void setApplicantId(String applicantId) {
        this.applicantId = applicantId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
} 