package com.DEVision.JobApplicant.notification.internal.dto;

/**
 * Request DTO for creating notifications
 */
public class NotificationRequest {
    
    private String title;
    private String content;
    private String type;
    
    // Constructors
    public NotificationRequest() {}
    
    public NotificationRequest(String title, String content, String type) {
        this.title = title;
        this.content = content;
        this.type = type;
    }
    
    // Getters and Setters
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
