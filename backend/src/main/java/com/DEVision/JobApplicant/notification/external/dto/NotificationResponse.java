package com.DEVision.JobApplicant.notification.external.dto;

import java.time.LocalDateTime;

// DTO for returning notification data to external services
public class NotificationResponse {
    
    private String id;
    private String userId;
    private String title;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;
    private String type;
    
    public NotificationResponse() {}
    
    public NotificationResponse(String id, String userId, String title, String content, 
                               LocalDateTime timestamp, boolean isRead, String type) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.type = type;
    }
    
    // Getters and Setters
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
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public boolean isRead() {
        return isRead;
    }
    
    public void setRead(boolean read) {
        isRead = read;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
}

