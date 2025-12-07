package com.DEVision.JobApplicant.notification.internal.dto;

import jakarta.validation.constraints.NotBlank;

// Internal DTO for marking notifications as read
public class MarkAsReadRequest {
    
    @NotBlank(message = "Notification ID is required")
    private String notificationId;
    
    public MarkAsReadRequest() {}
    
    public MarkAsReadRequest(String notificationId) {
        this.notificationId = notificationId;
    }
    
    public String getNotificationId() {
        return notificationId;
    }
    
    public void setNotificationId(String notificationId) {
        this.notificationId = notificationId;
    }
}

