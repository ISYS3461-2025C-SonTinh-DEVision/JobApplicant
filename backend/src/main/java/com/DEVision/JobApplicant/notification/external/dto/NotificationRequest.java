package com.DEVision.JobApplicant.notification.external.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

// DTO for external services to create notifications
public class NotificationRequest {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private String type; // Optional notification type
    
    private Map<String, Object> metadata; // Optional: additional data (e.g., job match details)
    
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
    
    public NotificationRequest(String userId, String title, String content, String type, Map<String, Object> metadata) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.type = type;
        this.metadata = metadata;
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
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}


