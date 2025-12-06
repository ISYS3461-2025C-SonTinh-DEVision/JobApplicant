package com.DEVision.JobApplicant.notification.external.dto;

import jakarta.validation.constraints.NotBlank;

// DTO for external services to create notifications
public class NotificationRequest {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private String type; // Optional notification type
    
    public NotificationRequest() {}
    
    public NotificationRequest(String userId, String title, String content) {
        this.userId = userId;
        this.title = title;
        this.content = content;
    }
    
    public NotificationRequest(String userId, String title, String content, String type) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.type = type;
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
}

